'use strict';
(() => {
  const form = document.querySelector('#quiz');
  const payload = document.querySelector('#quiz-data');
  if (!form || !payload) return;
  const exam = JSON.parse(payload.textContent);
  const submit = document.querySelector('#finish');
  const result = document.querySelector('#result');
  const solutions = document.querySelector('#solutions');
  const progress = document.querySelector('#progress');
  const meter = document.querySelector('#progress-meter');
  const edit = document.querySelector('#edit');
  const resetDialog = document.querySelector('#reset-dialog');
  const fields = [...form.querySelectorAll('fieldset')];
  let finished = false;
  let current = 0;
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const position = document.querySelector('#question-position');
  function showQuestion(index, focus = true) {
    current = Math.max(0, Math.min(fields.length - 1, index));
    fields.forEach((field, i) => { field.hidden = i !== current; });
    const isTest = current < exam.questions.length;
    form.querySelectorAll('.question-section-heading').forEach(heading => {
      heading.hidden = heading.dataset.section !== (isTest ? 'test' : 'written');
    });
    position.textContent = `${isTest ? 'Pregunta' : 'Ejercicio'} ${current + 1} de ${fields.length}`;
    previous.disabled = current === 0;
    next.hidden = current === fields.length - 1;
    submit.hidden = finished || current !== fields.length - 1;
    if (focus) {
      fields[current]?.querySelector('.question-title')?.focus({preventScroll:true});
      fields[current]?.scrollIntoView({block:'start',behavior:'auto'});
    }
  }
  previous.addEventListener('click', () => showQuestion(current - 1));
  next.addEventListener('click', () => showQuestion(current + 1));
  const selections = () => exam.questions.map((_, i) => {
    const checked = form.querySelector(`input[name="q-${i}"]:checked`);
    return checked ? Number(checked.value) : null;
  });
  function updateProgress() {
    const selected = selections().filter(value => value !== null).length;
    const written = [...form.querySelectorAll('textarea')].filter(field => field.value.trim()).length;
    const total = exam.questions.length + exam.openQuestions.length;
    progress.textContent = `${selected + written} de ${total} respondidas`;
    meter.max = total || 1;
    meter.value = selected + written;
  }
  function clearQuestionFeedback(i) {
    const field = document.querySelector(`#question-${i}`);
    const feedback = field.querySelector('.feedback');
    feedback.hidden = true;
    feedback.textContent = '';
    field.classList.remove('is-correct','is-wrong','is-blank');
    field.querySelectorAll('.is-correct,.is-wrong').forEach(node => node.classList.remove('is-correct','is-wrong'));
  }
  function clearFeedback() {
    exam.questions.forEach((_, i) => clearQuestionFeedback(i));
  }
  function checkQuestion(i, final = false) {
    clearQuestionFeedback(i);
    const question = exam.questions[i];
    const selected = selections()[i];
    const field = document.querySelector(`#question-${i}`);
    const feedback = field.querySelector('.feedback');
    if (selected === null && !final) {
      feedback.textContent = 'Selecciona una respuesta para corregirla.';
      feedback.hidden = false;
      return;
    }
    const state = selected === null ? 'blank' : selected === question.answer ? 'correct' : 'wrong';
    field.classList.add(`is-${state}`);
    const labels = field.querySelectorAll('label.option');
    labels[question.answer].classList.add('is-correct');
    if (state === 'wrong') labels[selected].classList.add('is-wrong');
    const status = document.createElement('strong');
    status.textContent = state === 'correct' ? 'Correcto' : state === 'wrong' ? 'Incorrecto' : 'En blanco';
    status.className = `feedback-${state}`;
    const explanation = document.createElement('span');
    explanation.textContent = `Respuesta correcta: ${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}. ${question.explanation}`;
    feedback.append(status, explanation);
    feedback.hidden = false;
  }
  function resume() {
    finished = false;
    fields.forEach(field => { field.disabled = false; });
    clearFeedback();
    result.hidden = true;
    result.replaceChildren();
    solutions.hidden = true;
    solutions.open = false;
    edit.hidden = true;
    showQuestion(0, false);
  }
  function line(text, className) {
    const p = document.createElement('p');
    p.textContent = text;
    if (className) p.className = className;
    result.append(p);
  }
  form.addEventListener('input', updateProgress);
  form.addEventListener('change', event => {
    updateProgress();
    const name = event.target.name;
    if (!finished && /^q-\d+$/.test(name || '')) clearQuestionFeedback(Number(name.slice(2)));
  });
  form.querySelectorAll('[data-check]').forEach(button => button.addEventListener('click', () => {
    if (!finished) checkQuestion(Number(button.dataset.check));
  }));
  form.querySelectorAll('[data-clear]').forEach(button => button.addEventListener('click', () => {
    const i = button.dataset.clear;
    clearQuestionFeedback(Number(i));
    form.querySelectorAll(`input[name="q-${i}"]`).forEach(input => { input.checked = false; });
    updateProgress();
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (finished) return;
    if (current < fields.length - 1) { showQuestion(current + 1); return; }
    const answers = selections();
    let correct = 0, wrong = 0, blank = 0;
    exam.questions.forEach((question, i) => {
      const selected = answers[i];
      const state = selected === null ? 'blank' : selected === question.answer ? 'correct' : 'wrong';
      if (state === 'correct') correct++; else if (state === 'wrong') wrong++; else blank++;
      checkQuestion(i, true);
    });
    fields.forEach(field => { field.disabled = true; });
    result.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = exam.questions.length ? 'Resultado del cuestionario' : 'Cuestionario finalizado';
    result.append(heading);
    if (exam.questions.length) {
      line(`${correct} ${correct === 1 ? 'acierto' : 'aciertos'} · ${wrong} ${wrong === 1 ? 'error' : 'errores'} · ${blank} en blanco`, 'result-counts');
      const scoring = exam.scoring;
      if (scoring) {
        const points = correct * scoring.correct + wrong * scoring.wrong;
        const number = value => value.toLocaleString('es-ES', {minimumFractionDigits:2, maximumFractionDigits:2});
        line(`${scoring.proposed ? 'Puntuación de práctica' : 'Puntos del test'}: ${number(points)} / ${number(exam.questions.length * scoring.correct)}`, 'result-score');
        line(scoring.note);
      } else {
        line('Se muestran aciertos, errores y blancos. No se asigna nota: la guía no concreta todas las reglas de puntuación.');
      }
    }
    if (exam.openQuestions.length) {
      const completed = [...form.querySelectorAll('textarea')].filter(field => field.value.trim()).length;
      line(`${completed} de ${exam.openQuestions.length} ejercicios de desarrollo respondidos.`);
      line('Las respuestas escritas no se califican automáticamente. Compáralas con las soluciones y rúbricas; puede haber varias respuestas válidas.');
    }
    line('Puedes revisar la corrección y abrir las soluciones completas.');
    finished = true;
    result.hidden = false;
    solutions.hidden = false;
    edit.hidden = false;
    submit.hidden = true;
    result.focus();
  });
  edit.addEventListener('click', () => { resume(); showQuestion(0); });
  document.querySelector('#restart').addEventListener('click', () => {
    const hasAnswers = selections().some(value => value !== null) || [...form.querySelectorAll('textarea')].some(field => field.value.trim());
    if (hasAnswers || finished) resetDialog.showModal();
    else { resume(); updateProgress(); }
  });
  document.querySelector('#cancel-reset').addEventListener('click', () => resetDialog.close());
  document.querySelector('#confirm-reset').addEventListener('click', () => {
    form.reset(); resume(); updateProgress(); resetDialog.close();
    showQuestion(0);
  });
  // The case data are part of the exam and must be present in printed copies.
  let casesClosedBeforePrint = [];
  window.addEventListener('beforeprint', () => {
    casesClosedBeforePrint = [...form.querySelectorAll('.case-data:not([open])')];
    casesClosedBeforePrint.forEach(details => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    casesClosedBeforePrint.forEach(details => { details.open = false; });
    casesClosedBeforePrint = [];
  });
  document.querySelector('#print').addEventListener('click', () => window.print());
  submit.disabled = false;
  updateProgress();
  showQuestion(0, false);
})();
