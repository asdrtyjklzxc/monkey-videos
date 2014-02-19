#!/usr/bin/env python3

# Copyright (C) 2014 LiuLang <gsushzhsosgsu@gmail.com>
# Use of this source code is governed by GPLv3 license that can be found
# in http://www.gnu.org/licenses/gpl-3.0.html

__VERSION__ = '1.2'

import json
import math
import os
import random
import sys
import threading
from urllib.error import HTTPError
from urllib.error import URLError
from urllib import parse
from urllib import request

from gi.repository import GLib
from gi.repository import GObject
GObject.threads_init()
from gi.repository import Gtk
from lxml import html
from lxml.cssselect import CSSSelector as CSS

from mutagenx.id3 import ID3
from mutagenx.id3 import COMM
from mutagenx.id3 import TAL
from mutagenx.id3 import TALB
from mutagenx.id3 import TCOM
from mutagenx.id3 import TDRC
from mutagenx.id3 import TIT2
from mutagenx.id3 import TPE1
from mutagenx.id3 import WXXX

CHUNK = 2 ** 14
CONF_FILE = 'config.json'
DEFAULT_CONF = {
        'basedir': os.path.expanduser('~/Music'), # 保存到这里
        'max-id': 74900,         # 最大页面id
        'curr-id': 1,          # 当前页面id
        'first-run': True,
        'window-size': (480, 320),
        'threads': 3,          # 下载线程数, 3个线程就足够了
        }
RETRIES = 3


def iconvtag(song_path, song):
    audio = ID3(song_path)
    audio.update_to_v24()
    #audio.delete()
    audio.add(TIT2(encoding=3, text=song['title']))
    audio.add(TPE1(encoding=3, text=song['artist']))
    audio.add(TAL(encoding=3, text=song['album']))
    audio.add(TALB(encoding=3, text=song['album']))
    audio.add(TCOM(encoding=3, text=song['composer']))
    audio.add(TDRC(encoding=3, text=song['date']))
    audio.add(WXXX(encoding=3, desc='', url=song['url']))
    audio.delall('COMM')
    audio.add(COMM(encoding=3, desc='', text=song['comment']))
    audio.save()

def random_id(start=1, end=74699):
    '''生成随机化序列'''
    l = list(range(start, end))
    random.shuffle(l)
    return l

# calls f on another thread
def async_call(func, *args, callback=None):
    '''Execute this function in a new thread.

    @param args, arguments passed to func.
    @param callback, if callback is callable, it will be called in
    Main-Thread
    '''
    def do_call(*args):
        result = None
        error = None

        try:
            result = func(*args)
        except Exception as e:
            error = e
        if callable(callback):
            GObject.idle_add(lambda: callback(result, error))

    thread = threading.Thread(target=do_call, args=args)
    thread.start()

def load_conf():
    if not os.path.exists(CONF_FILE):
        dump_conf(DEFAULT_CONF)
        return DEFAULT_CONF
    with open(CONF_FILE) as fh:
        return json.load(fh)

def dump_conf(conf):
    with open(CONF_FILE, 'w') as fh:
        json.dump(conf, fh)

def get_page_url(id_):
    return 'http://www.justing.com.cn/page/{0}.html'.format(id_)

def get_mp3_url(title):
    return 'http://dl.justing.com.cn/page/{0}.mp3'.format(
            parse.quote(title))

def check_page_exists(id_):
    url = get_page_url(id_)
    try:
        req = request.urlopen(url)
        return True
    except HTTPError as e:
        return False

def binary_search(start, end):
    while start != end:
        id_ = math.ceil((start + end) / 2)
        print('current id:', id_)
        if check_page_exists(id_):
            start = math.ceil((start + end) / 2)
            print('exists:', start, end)
        else:
            end = math.ceil((start + end) // 2)
            print('not exists:', start, end)
    return start



def parse_page(id_):
    url = get_page_url(id_)
    info = {
            'id': id_,
            'url': url,
            'album': '',
            'title': '',
            'date': '',
            'artist': '',
            'composer': '',
            'comment': '',
            }
    tree = html.parse(url)
    sel_album = CSS('div.nav a:last-child')

    elem_album = sel_album(tree)
    if elem_album:
        info['album'] = elem_album[0].text

    sel_title = CSS('div#title')
    elem_title = sel_title(tree)
    if elem_title:
        info['title'] = elem_title[0].text
    else:
        return None

    sel_date = CSS('div.info div.left div:last-child')
    elem_date = sel_date(tree)
    if elem_date:
        info['date'] = elem_date[0].text

    sel_authors = CSS('div.left div.value a')
    elem_authors = sel_authors(tree)
    if elem_authors:
        info['composer'] = elem_authors[0].text
        info['artist'] = elem_authors[1].text

    sel_comment = CSS('div#desc')
    elem_comment = sel_comment(tree)
    if elem_comment:
        info['comment'] = elem_comment[0].text
    return info


class Downloader(GObject.GObject, threading.Thread):
    __gsignals__ = {
            'ready': (GObject.SIGNAL_RUN_LAST,
                # song id, title
                GObject.TYPE_NONE, (int, str)),
            'chunk-received': (GObject.SIGNAL_RUN_LAST,
                # percent
                GObject.TYPE_NONE, (int, )),
            'downloaded': (GObject.SIGNAL_RUN_LAST, 
                # song_path
                GObject.TYPE_NONE, (str, ))
            }

    def __init__(self, app):
        GObject.GObject.__init__(self)
        threading.Thread.__init__(self)
        self.app = app
        self._force_stop = False
        self.tree_iter = None

    def stop(self):
        self.app.conf['curr-id'] = self.app.conf['curr-id'] - 1
        self._force_stop = True

    def stopped(self):
        return self._force_stop

    def run(self):
        while not self._force_stop:
            self.set_song()

    def get_song_path(self):
        dir_name = os.path.join(self.app.conf['basedir'], self.song['album'])
        if not os.path.exists(dir_name):
            os.makedirs(dir_name, exist_ok=True)
        return os.path.join(dir_name, self.song['title'] + '.mp3')

    def set_song(self):
        if self.app.conf['curr-id'] >= self.app.conf['max-id']:
            self.stop()
            return
        self.app.conf['curr-id'] = self.app.conf['curr-id'] + 1
        id_ = self.app.conf['curr-id']
        self.song = parse_page(id_)
        if self.song:
            self.song['mp3'] = get_mp3_url(self.song['title'])
            #print(self.song)
            self.emit('ready', self.song['id'], self.song['title'])
            self.download()
        else:
            print('Error occured while parsing song info with id:', id_)

    def download(self, retries=RETRIES):
        song_path = self.get_song_path()
        if os.path.exists(song_path):
            self.emit('downloaded', song_path)
            return
        try:
            url = parse.quote(self.song['mp3'])
            req = request.urlopen(self.song['mp3'])
            received_size = 0
            can_play_emited = False
            content_length = int(req.headers.get('Content-Length'))
            fh = open(song_path, 'wb')

            while True:
                if self._force_stop:
                    del req
                    fh.close()
                    os.remove(song_path)
                    self.emit('downloaded', song_path)
                    return
                chunk = req.read(CHUNK)
                received_size += len(chunk)
                percent = int(received_size/content_length * 100)
                #print(percent)
                # for better performance, reduce this signal emitions
                if percent % 10 == 0:
                    self.emit('chunk-received', percent)
                if not chunk:
                    break
                fh.write(chunk)
            fh.close()
            self.emit('downloaded', song_path)
            iconvtag(song_path, self.song)
            return
        except URLError as e:
            print(e)
            self.emit('downloaded', song_path)
GObject.type_register(Downloader)


class App(Gtk.Window):

    def __init__(self):
        super().__init__()
        self.conf = load_conf()
        self.downloaders = []

        self.set_default_size(*self.conf['window-size'])
        self.connect('delete-event', self.on_app_exit)
        self.connect('check-resize', self.on_window_resized)

        vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        self.add(vbox)

        toolbar = Gtk.Toolbar()
        toolbar.props.show_arrow = False
        toolbar.props.icon_size = 5
        toolbar.get_style_context().add_class(Gtk.STYLE_CLASS_MENUBAR)
        vbox.pack_start(toolbar, False, False, 0)

        start_button = Gtk.ToolButton('Start')
        start_button.set_icon_name('media-playback-start-symbolic')
        start_button.is_paused = False
        start_button.set_tooltip_text('开始/停止')
        toolbar.insert(start_button, 0)
        start_button.connect('clicked', self.on_start_button_clicked)

        pref_button = Gtk.ToolButton('Preferences')
        pref_button.set_icon_name('preferences-system-symbolic')
        pref_button.props.margin_left = 10
        toolbar.insert(pref_button, 1)
        pref_button.connect('clicked', self.on_pref_button_clicked)

        refresh_button = Gtk.ToolButton('Refresh')
        refresh_button.set_icon_name('view-refresh-symbolic')
        refresh_button.props.margin_left = 10
        refresh_button.set_tooltip_text('自动获取网站的最大ID')
        toolbar.insert(refresh_button, 2)
        refresh_button.connect('clicked', self.on_refresh_button_clicked)

        # id, name, percent
        self.liststore = Gtk.ListStore(int, str, int)
        self.treeview = Gtk.TreeView(model=self.liststore)
        vbox.pack_start(self.treeview, True, True, 0)
        title_cell = Gtk.CellRendererText()
        title_col = Gtk.TreeViewColumn('Title', title_cell, text=1)
        self.treeview.append_column(title_col)
        #percent_cell = Gtk.CellRendererProgress()
        #percent_col = Gtk.TreeViewColumn('Percent', percent_cell, value=2)
        #self.treeview.append_column(percent_col)

    def run(self):
        self.show_all()
        if self.conf['first-run']:
            self.conf['first-run'] = False
            GLib.timeout_add(1500, self.show_preference)
        Gtk.main()

    def control_download(self, stop=False):
        if self.downloaders:
            for downloader in self.downloaders:
                downloader.stop()
        if not stop:
            self.downloaders = []
            for i in range(self.conf['threads']):
                downloader = Downloader(self)
                downloader.connect('ready', self.on_download_ready)
                # too slow
                #downloader.connect(
                #        'chunk-received', self.on_download_chunk_received)
                downloader.connect('downloaded', self.on_download_downloaded)
                downloader.start()
                self.downloaders.append(downloader)

    def on_download_ready(self, downloader, id_, title):
        def _on_ready():
            downloader.tree_iter = self.liststore.append([id_, title, 0])
        GLib.idle_add(_on_ready)

    def on_download_chunk_received(self, downloader, percent):
        def _on_chunk_received():
            self.liststore[downloader.tree_iter][0] = percent
        GLib.idle_add(_on_chunk_received)

    def on_download_downloaded(self, downloader, song_path):
        def _on_downloaded():
            self.liststore.remove(downloader.tree_iter)
        GLib.idle_add(_on_downloaded)

    def show_preference(self):
        def on_dir_update(button):
            dir_name = button.get_filename()
            if dir_name:
                self.conf['basedir'] = dir_name

        def on_thread_update(spin):
            self.conf['threads'] = int(spin.get_value())

        def on_currend_id_update(spin):
            self.conf['curr-id'] = int(spin.get_value())

        def on_max_id_update(spin):
            self.conf['max-id'] = int(spin.get_value())

        dialog = Gtk.Dialog(
                'Preferences', self, Gtk.DialogFlags.MODAL,
                (Gtk.STOCK_CLOSE, Gtk.ResponseType.OK))
        dialog.set_default_size(400, 280)
        box = dialog.get_content_area()
        box.props.margin = 10

        dir_box = Gtk.Box()
        box.pack_start(dir_box, False, False, 5)
        dir_label = Gtk.Label('保存到:')
        dir_box.pack_start(dir_label, False, False, 0)
        dir_button = Gtk.FileChooserButton()
        dir_button.set_action(Gtk.FileChooserAction.SELECT_FOLDER)
        dir_button.set_current_folder(self.conf['basedir'])
        dir_button.connect('file-set', on_dir_update)
        dir_box.pack_end(dir_button, False, False, 0)

        thread_box = Gtk.Box()
        box.pack_start(thread_box, False, False, 5)
        thread_label = Gtk.Label('同时执行多少个下载任务:')
        thread_box.pack_start(thread_label, False, False, 0)
        thread_spin = Gtk.SpinButton.new_with_range(1, 5, 1)
        thread_spin.set_value(self.conf['threads'])
        thread_spin.connect('value-changed', on_thread_update)
        thread_box.pack_end(thread_spin, False, False, 0)

        id0_box = Gtk.Box()
        box.pack_start(id0_box, False, False, 5)
        id0_label = Gtk.Label('当前的页面id:')
        id0_box.pack_start(id0_label, False, False, 0)
        id0_spin = Gtk.SpinButton.new_with_range(0, 1000000, 1)
        id0_spin.set_value(self.conf['curr-id'])
        id0_spin.set_tooltip_text('从这个id开始下载, 这个值不需要手动修改')
        id0_spin.connect('value-changed', on_currend_id_update)
        id0_box.pack_end(id0_spin, False, False, 0)

        id_box = Gtk.Box()
        box.pack_start(id_box, False, False, 5)
        id_label = Gtk.Label('页面id的最大值:')
        id_box.pack_start(id_label, False, False, 0)
        id_spin = Gtk.SpinButton.new_with_range(100, 1000000, 100)
        id_spin.set_value(self.conf['max-id'])
        id_spin.set_tooltip_text('目前最大的id是74699, 但可能每天都会有更新')
        id_spin.connect('value-changed', on_max_id_update)
        id_box.pack_end(id_spin, False, False, 0)

        box.show_all()
        dialog.run()
        dialog.destroy()

    def on_app_exit(self, *args):
        dump_conf(self.conf)
        Gtk.main_quit()

    def on_window_resized(self, *args):
        self.conf['window-size'] = self.get_size()

    def on_start_button_clicked(self, button):
        if button.is_paused:
            button.set_icon_name('media-playback-start-symbolic')
        else:
            button.set_icon_name('media-playback-stop-symbolic')
        self.control_download(button.is_paused)
        button.is_paused = (not button.is_paused)

    def on_pref_button_clicked(self, button):
        self.show_preference()

    def on_refresh_button_clicked(self, button):
        def reset_sensitive(max_id, error):
            print('reset sensitive():', max_id)
            button.set_sensitive(True)
            diff = max_id - self.conf['max-id']
            if diff <= 0:
                return
            self.conf['max-id'] = max_id
            dialog = Gtk.MessageDialog(
                    self,
                    Gtk.DialogFlags.MODAL,
                    Gtk.MessageType.INFO,
                    Gtk.ButtonsType.CLOSE,
                    '有更新')
            dialog.format_secondary_text('最近更新了{0}首'.format(diff))
            dialog.run()
            dialog.destroy()

        button.set_sensitive(False)
        async_call(
                binary_search,
                self.conf['max-id'],          # start
                self.conf['max-id'] + 2000,   # end
                callback=reset_sensitive)


def main():
    app = App()
    app.run()


if __name__ == '__main__':
    main()
