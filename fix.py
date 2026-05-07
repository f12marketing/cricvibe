import os, glob
for file_path in glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.js', recursive=True):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if r'\${' in content:
        content = content.replace(r'\${', '${')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed", file_path)
