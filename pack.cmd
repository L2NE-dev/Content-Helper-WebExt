call openssl genrsa -out ./pack/math.pem 2048
call crx3 ./dist/ -p ./pack/math.pem -o ./pack/math.crx
call web-ext build --source-dir=./dist/ --artifacts-dir=./pack/ --overwrite-dest=true -n math.xpi
call web-ext sign --source-dir=./dist/ --api-key=./pack/math.pem --api-secret=./pack/math.pem --channel unlisted
pause
