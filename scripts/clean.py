import os

for f in os.listdir('policy_documents'):
    if not f.endswith('.md'): continue
    path = os.path.join('policy_documents', f)
    with open(path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    with open(path, 'w', encoding='utf-8') as file:
        for line in lines:
            if line.startswith('## Appendix A:'):
                break
            file.write(line)
