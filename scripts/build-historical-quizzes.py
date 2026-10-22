import json,re
from pathlib import Path
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--workspace',type=Path,required=True,help='Workspace containing work/historical/questions.json and documents.json')
root=parser.parse_args().workspace
p=Path(__file__).resolve().parents[1]
qs=json.loads((root/'work/historical/questions.json').read_text())
docs={d['sha256']:d for d in json.loads((root/'work/historical/documents.json').read_text())}
exams={}
for q in qs:
 d=docs[q['file']]
 if d.get('duplicateOf'):continue
 e=exams.setdefault(q['file'],dict(name=d['name'],subject=d['subject'],questions=[]))
 body=q['body'].strip()
 matches=list(re.finditer(r'(?m)^\s*([a-d])[).]\s+',body,re.I))
 labels=[m[1].lower() for m in matches]
 options=[];stem=body
 # Only split a single unambiguous ordered option group. Other layouts retain all text.
 if labels in [['a','b','c','d'],['a','b','c']]:
  stem=body[:matches[0].start()].strip()
  options=[body[m.end():matches[i+1].start() if i+1<len(matches) else len(body)].strip() for i,m in enumerate(matches)]
  if any(len(o)>1600 or not o for o in options):options=[];stem=body
 e['questions'].append(dict(number=q['number'],text=stem,options=options))
solutions=json.loads((p/'content/historical-solutions.json').read_text()) if (p/'content/historical-solutions.json').exists() else {}
for hash,e in exams.items():
 for q in e['questions']:
  sol=solutions.get(hash,{}).get(str(q['number']))
  if sol and q['options'] and 0<=sol['correct']<len(q['options']):q.update(sol)
(p/'content/historical-quizzes.json').write_text(json.dumps(exams,ensure_ascii=False))
index=json.loads((p/'app/campus/historical-index.json').read_text())
for s in index.values():
 for f in s['exams']:f['quizQuestions']=len(exams.get(f['hash'],{}).get('questions',[]))
(p/'app/campus/historical-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2))
print(len(exams),'exams',sum(len(e['questions']) for e in exams.values()),'questions')
