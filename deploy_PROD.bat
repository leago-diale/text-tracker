
@echo off
echo Compiling...
cmd /c "ng build --build-optimizer "
echo Clearing target directory
rmdir /s/q \\bfmweb03.bidvestfm.co.za\d\inetpub\wwwroot\local.bidvestfm.co.za\BCTEXTS
mkdir \\bfmweb03.bidvestfm.co.za\d\inetpub\wwwroot\local.bidvestfm.co.za\BCTEXTS
echo Copying compiled code to target directory
xcopy .\dist\text-tracker\* \\bfmweb03.bidvestfm.co.za\d\inetpub\wwwroot\local.bidvestfm.co.za\BCTEXTS /e /y
echo
echo Done!