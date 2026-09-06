const form = document.getElementById('registrationForm');
const sheet = document.querySelector('.sheet');
const statusEl = document.getElementById('recordStatus');

let currentRecordId = null;

function makeId() {
  return 'REG-' + Date.now().toString(36).toUpperCase() + '-' +
    Math.random().toString(36).slice(2, 7).toUpperCase();
}

function setStatus(message, type = 'ok') {
  statusEl.textContent = message;
  statusEl.className = 'record-status ' + type;
}

function enforceSingleCheckboxGroups() {
  document.querySelectorAll('[data-single-group]').forEach(group => {
    group.addEventListener('change', e => {
      if (e.target.type !== 'checkbox' || !e.target.checked) return;

      group.querySelectorAll('input[type="checkbox"]').forEach(box => {
        if (box !== e.target) box.checked = false;
      });
    });
  });
}

function checked(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function collectForm() {
  const raw = Object.fromEntries(new FormData(form).entries());

  return {
    idRegistro: currentRecordId || makeId(),
    fechaRegistro: new Date().toLocaleString('es-NI'),
    fechaRegistroISO: new Date().toISOString(),

    nombres: raw.nombres || '',
    apellidos: raw.apellidos || '',
    edad: raw.edad || '',
    telefono: raw.telefono || '',
    correo: raw.correo || '',
    talla: checked('talla'),

    region: raw.region || '',
    distrito: raw.distrito || '',
    iglesia: raw.iglesia || '',
    pastor: raw.pastor || '',
    cargo: checked('cargo'),

    condicionMedica: checked('condicionMedica'),
    detalleMedico: raw.detalleMedico || '',

    monto: raw.monto || '',
    firmaLider: raw.firmaLider || '',
    dia: raw.dia || '',
    mes: raw.mes || '',
    anio: '2026'
  };
}

function fillForm(data) {
  const fields = [
    'nombres','apellidos','edad','telefono','correo',
    'region','distrito','iglesia','pastor','detalleMedico',
    'monto','firmaLider','dia','mes'
  ];

  fields.forEach(name => {
    if (form.elements[name]) {
      form.elements[name].value = data[name] ?? '';
    }
  });

  ['talla','cargo','condicionMedica'].forEach(name => {
    form.querySelectorAll(`input[name="${name}"]`).forEach(box => {
      box.checked = box.value === (data[name] || '');
    });
  });
}

function validate() {
  if (
    !form.elements.nombres.value.trim() ||
    !form.elements.apellidos.value.trim()
  ) {
    setStatus(
      'Completa nombres y apellidos antes de guardar.',
      'error'
    );
    return false;
  }

  return true;
}

async function saveRecord() {
  if (!validate()) return;

  try {
    const data = collectForm();

    await firebase
      .database()
      .ref('registros/' + data.idRegistro)
      .set(data);

    currentRecordId = data.idRegistro;

    setStatus(
      `Registro guardado correctamente: ${data.idRegistro}`,
      'ok'
    );

    alert(
      'Registro guardado correctamente.\n\nID: ' +
      data.idRegistro
    );

  } catch (error) {
    console.error(error);

    setStatus(
      'No se pudo guardar el registro en Firebase.',
      'error'
    );

    alert(
      'Error al guardar.\n\n' +
      'Revisa tu conexión a Internet y la configuración de Firebase.'
    );
  }
}

async function loadRecord(id) {
  try {
    const snapshot = await firebase
      .database()
      .ref('registros/' + id)
      .once('value');

    if (!snapshot.exists()) {
      setStatus('No se encontró ese registro.', 'error');
      return;
    }

    const data = snapshot.val();

    currentRecordId = id;

    fillForm(data);

    sheet.classList.add('preview-mode');

    setStatus(
      `Registro ${id} cargado. Puedes editarlo o imprimirlo.`,
      'info'
    );

  } catch (error) {
    console.error(error);
    setStatus('No se pudo cargar el registro.', 'error');
  }
}

function newForm() {
  currentRecordId = null;

  form.reset();

  sheet.classList.remove('preview-mode');

  setStatus(
    'Nueva ficha lista para llenar.',
    'info'
  );

  history.replaceState({}, '', 'index.html');
}

document.getElementById('btnPreview').onclick = () => {
  sheet.classList.add('preview-mode');
  setStatus('Vista previa activada.', 'info');
};

document.getElementById('btnEdit').onclick = () => {
  sheet.classList.remove('preview-mode');
  setStatus('Modo edición activado.', 'info');
};

document.getElementById('btnPrint').onclick = () => {
  window.print();
};

document.getElementById('btnSave').onclick = saveRecord;

document.getElementById('btnClear').onclick = () => {
  if (
    confirm(
      '¿Crear una nueva ficha? Los registros guardados no se borrarán.'
    )
  ) {
    newForm();
  }
};

document.getElementById('btnRecords').onclick = () => {
  location.href = 'registros.html';
};

enforceSingleCheckboxGroups();

const params = new URLSearchParams(location.search);

if (params.get('id')) {
  loadRecord(params.get('id'));
} else {
  setStatus(
    'Nueva ficha. Lista para guardar en Firebase.',
    'info'
  );
}
