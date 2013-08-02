#!/bin/bash
if [ $# -ne 1 ]; then
  echo "please use $0 [jus|smellman]"
  exit 1
fi

if [ $1 = "jus" ]; then
  echo "deploy to ll.jus.or.jp/2013"
  rm -fr ../deploy/ll.jus
  bundle exec jekyll --base-url http://ll.jus.or.jp/2013 ../deploy/ll.jus
  rsync -av --delete ../deploy/ll.jus/ ll.jus.or.jp:/usr/local/docs/ll.jus.or.jp/llweb/2013
  exit 1
fi

if [ $1 = "smellman" ]; then
  echo "deploy to ll2013.smellman.org"
  rm -fr ../deploy/smellman.org
  bundle exec jekyll --base-url http://ll2013.smellman.org ../deploy/smellman.org
  rsync -av --delete ../deploy/smellman.org/ synthamesk:/home/nginx/ll2013
  exit 1
fi

