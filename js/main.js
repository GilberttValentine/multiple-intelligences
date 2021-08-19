const modules = { module_sections: null, module_intelligences: null };

const requestURL = 'js/questions.json';

const request = fetch(requestURL)
  .then((response) => {
    const { status } = response;

    if (status !== 200) {
      console.error(`Looks like there was a problem. Status Code: ${status}`);
      $start.disabled = true;

      return;
    }

    response.json().then((data) => {
      const { sections, intelligences } = data;

      module_sections = sections;
      module_intelligences = intelligences;

      return;
    });
  });

const $content = document.querySelector('.steps');
const $start = document.querySelector('#start');

const forms = [];
const totalValues = [];

let actualForm = 1;
let maxForms = 0;

$start.addEventListener('click', handleStart);

function handleStart() {
  if (module_sections === null || module_intelligences === null && isNaN(modules)) {
    return;
  }

  $start.remove();

  generateForms(module_sections);
  generateFormActions();
}

function generateForms(sections) {
  maxForms = sections.length;

  sections.map((it) => {
    const form = document.createElement('form');
    const id = it.section;

    form.id = id;

    form.innerHTML = `
      <div class="section">
        <h2>Sección ${id}</h2>
      </div>
    `;

    const div = document.createElement('div');
    div.className = 'questions';

    it.questions.map((it, index) => {
      div.innerHTML += `
        <div class="question">
          <label class="form-label">${it.title}.</label>
          <input type="number" class="form-control form-control-sm" id="${id}${index + 1}" placeholder="Ingresa un número entre 0 y 5" min="0" max="5" autocomplete="off" ${index === 0 ? "autofocus" : ""} >
          <div id="valid-feedback-${id}${index + 1}" class="form-text text-danger" hidden></div>
        </div>
      `;
    });

    form.appendChild(div);

    forms.push({
      id: it.section,
      form: form
    });
  });

  document.querySelector('.steps-content').remove();

  showForm();
}

function showForm() {
  const formActive = forms[actualForm - 1];

  $content.appendChild(formActive.form);
  document.querySelector('.section').appendChild($formActions);
  hasScrollbar();
}

const $formActions = document.querySelector('#form-actions');

const $back = document.createElement('button');
const $next = document.createElement('button');
const $submit = document.createElement('button');
const $reset = document.createElement('button');

function generateFormActions() {

  $formActions.remove();

  document.querySelector('.section').appendChild($formActions);

  $back.setAttribute('class', 'btn-form btn-outline-primary');
  $back.setAttribute('type', 'button');
  $back.setAttribute('hidden', '');
  $back.setAttribute('id', 'back');
  $back.setAttribute('aria-label', 'Atrás');
  $back.setAttribute('title', 'Atrás');
  $back.textContent = 'Atrás';

  $back.addEventListener('click', handleBack);

  $formActions.appendChild($back);

  $next.setAttribute('class', 'btn-form btn-primary');
  $next.setAttribute('type', 'button');
  $next.setAttribute('id', 'next');
  $next.setAttribute('aria-label', 'Siguiente');
  $next.setAttribute('title', 'Siguiente');
  $next.textContent = 'Siguiente';

  $next.addEventListener('click', handleNext);

  $formActions.appendChild($next);

  $submit.setAttribute('class', 'btn-form btn-primary');
  $submit.setAttribute('type', 'button');
  $submit.setAttribute('id', 'endSurvey');
  $submit.setAttribute('title', 'Finalizar cuestionario');
  $submit.setAttribute('aria-label', 'Finalizar cuestionario');
  $submit.textContent = 'Finalizar';

  $submit.addEventListener('click', handleSubmit);

  $reset.setAttribute('class', 'btn btn-primary btn-block btn-lg');
  $reset.setAttribute('type', 'button');
  $reset.setAttribute('id', 'reset');
  $reset.setAttribute('title', 'Volver a empezar');
  $reset.setAttribute('aria-label', 'Volver a empezar');
  $reset.textContent = 'Reiniciar';

  $reset.addEventListener('click', handleReset);
}

function handleBack() {
  removeForm();
  actualForm -= 1;

  if (actualForm <= 1) {
    actualForm = 1;
    $back.hidden = true;
  } else {
    $submit.remove();
    $formActions.appendChild($next);

    $back.hidden = false;
    $next.hidden = false;
  }

  showForm();
}

function handleNext() {
  if (saveTotalValue()) {
    removeForm();
    actualForm += 1;

    if (actualForm >= maxForms) {
      actualForm = maxForms;
      $next.remove();
      $formActions.appendChild($submit);
    } else {
      $next.hidden = false;
      $back.hidden = false;
    }

    showForm();
  }
}

function removeForm() {
  const formActive = forms[actualForm - 1];

  $content.removeChild(formActive.form);
}

function saveTotalValue() {
  const formActive = forms[actualForm - 1];

  const inputs = document.querySelectorAll(`input[id*=${formActive.id}]`);

  if (!validateInputs(inputs)) {
    return false;
  }

  let total = 0;

  inputs.forEach(it => {
    total += parseInt(it.value);
  });

  const isExisting = totalValues.find(it => it.id === formActive.id);

  if (isExisting) {
    isExisting.totalValue = total;
  } else {
    totalValues.push(
      {
        id: formActive.id,
        totalValue: total
      });
  }

  return true;
}

function showError(message, object) {
  object.hidden = false;
  object.textContent = message;
}

function hiddeError(object) {
  object.hidden = true;
  object.textContent = "";
}

function validateInputs(inputs) {

  let occurrences = 0;

  inputs.forEach((it) => {
    const feedBack = document.querySelector(`div[id*=valid-feedback-${it.id}]`);

    if (isNaN(it.value) || it.value > 5 || it.value < 0 || it.value === "") {
      const message = 'Por favor solo ingrese números en una escala de 0 a 5.';

      occurrences += 1;

      showError(message, feedBack);
    } else {
      hiddeError(feedBack);
    }
  });

  hasScrollbar();

  if (occurrences === 0) {
    return true;
  }

  return false;
}

function handleSubmit() {
  if (saveTotalValue()) {
    document.querySelector("#back").remove();
    document.querySelector("#endSurvey").remove();

    removeForm();
    $formActions.remove();
    $formActions.appendChild($reset);

    showResults(module_intelligences);
  }
}

function handleReset() {
  location.reload();
}

function showResults(sections) {

  $content.innerHTML = `
    <h2>Inteligencias múltiples</h2>
  `;

  const div = document.createElement('div');
  div.className = 'results';

  div.innerHTML = `
    <p>En el siguiente apartado y con base a las respuestas otorgadas, se mostrará en el siguiente apartado una serie de clasificaciones que mostraran las inteligencias múltiples en las cuales más destaca. Estas clasificaciones le permiten formular o tener presente un perfil de aprendizaje, cuyo propósito es el de orientar al estudiante sobre qué programa de formación podría escoger para sus estudios. Por lo tanto, tómese su tiempo para pensar en que tan bien estos resultados reflejan la forma en la que mejor comprende o aprende.</p>
    <h3>Resultados</h3>
  `;

  const ol = document.createElement('ol');

  let results = totalValues.filter(it => it.totalValue >= 15);

  if (results.length === 0 || results.length < 4) {
    results = totalValues.filter(it => it.totalValue >= 15 || it.totalValue <= 15);
  }

  results.sort((a, b) => b.totalValue - a.totalValue);

  results.slice(0, 4).map((result) => {
    const li = document.createElement('li');
    const section = sections.find(it => it.section === result.id);

    li.innerHTML = `
      <h4>${section.name}</h4>
      &nbsp;&nbsp;
      <span><small>&#8212;</small></span>
      &nbsp;&nbsp;
      <span><small>Obtuviste ${result.totalValue} puntos</small></span>
    `;

    const p = document.createElement('p');

    section.associated_academic_programs.map((it, index) => {
      if ((index + 1) === section.associated_academic_programs.length) {
        p.innerHTML += `
        ${it.name}.
      `;
      } else {
        p.innerHTML += `
        ${it.name},
      `;
      }
    });

    li.appendChild(p);

    ol.append(li);
  });

  div.appendChild(ol);
  div.appendChild($formActions);

  $content.appendChild(div);

}

function hasScrollbar() {
  $scrollElement = document.querySelector('.questions');

  if ($scrollElement !== null && $scrollElement.scrollHeight > $scrollElement.clientHeight) {
    $scrollElement.classList.add('pd-r-2');
  } else {
    $scrollElement.classList.remove('pd-r-2');
  }
}

addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    console.log('Ha presionado Enter');
  }
});