del index.zip 
powershell.exe -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('lambda', 'index.zip'); }"
aws lambda update-function-code --function-name EventFinderLambda --zip-file fileb://index.zip