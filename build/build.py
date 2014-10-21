#!/usr/bin/env python3

import os


handlers = [
    '56.js',
    'acfun.js',
    'bilibili.js',
    'cntv.js',
    'funshion.js',
    'ifeng.js',
    'iqiyi.js',
    'letv.js',
    'justing.js',
    'ku6.js',
    'netease.js',
    'pps.js',
    'sina.js',
    'sohu.js',
    'tucao.js',
    'tudou.js',
    'wasu.js',
    'youku.js',
    'youtube.js',
]

def build():
    def write_includes():
        for handler in handlers:
            name = os.path.splitext(handler)[0]
            header_path = os.path.join('../', name, header)
            out.write(open(header_path).read())

    def write_handlers():
        for handler in handlers:
            name = os.path.splitext(handler)[0]
            handler_path = os.path.join('../', name, handler)
            print(handler_path)
            out.write(open(handler_path).read())

    header = 'header.js'
    input_path = 'monkey-videos.js'
    output_path = '../monkey-videos.user.js'
    with open(input_path) as fh, open(output_path, 'w') as out:
        for line in fh:
            if line.startswith('IMPORT_INCLUDES'):
                write_includes()
            elif line.startswith('IMPORT_HANDLERS'):
                write_handlers()
            else:
                out.write(line)


if __name__ == '__main__':
    build()
