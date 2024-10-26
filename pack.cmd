mkdir .\pack\
call npm run build
call openssl genrsa -out ./pack/math.pem 2048
call crx3 ./dist/ -p ./pack/math.pem -o ./pack/math.crx
call web-ext build --source-dir=./dist/ --artifacts-dir=./pack/ --overwrite-dest=true -n math.xpi
pause
