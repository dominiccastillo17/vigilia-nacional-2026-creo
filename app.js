const form = document.getElementById('registrationForm');
const sheet = document.querySelector('.sheet');
const statusEl = document.getElementById('recordStatus');

let currentRecordId = null;

/* =========================================================
   SUPABASE
   ========================================================= */

function supabaseReady() {
  return (
    typeof window.supabaseClient !== 'undefined' &&
    window.supabaseClient !== null
  );
}

function setStatus(message, type = 'ok') {
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = 'record-status ' + type;
}

/* =========================================================
   GENERAR ID
   ========================================================= */

function makeId() {
  return (
    'REG-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 7).toUpperCase()
  );
}

/* =========================================================
   CHECKBOX DE SELECCIÓN ÚNICA
   ========================================================= */

function enforceSingleCheckboxGroups() {
  document.querySelectorAll('[data-single-group]').forEach(group => {
    group.addEventListener('change', event => {
      if (
        event.target.type !== 'checkbox' ||
        !event.target.checked
      ) {
        return;
      }

      group
        .querySelectorAll('input[type="checkbox"]')
        .forEach(box => {
          if (box !== event.target) {
            box.checked = false;
          }
        });
    });
  });
}

/* =========================================================
   OBTENER CHECKBOX MARCADO
   ========================================================= */

function checked(name) {
  const selected = form.querySelector(
    `input[name="${name}"]:checked`
  );

  return selected ? selected.value : '';
}

/* =========================================================
   RECOPILAR FORMULARIO
   ========================================================= */

function collectForm() {
  const raw = Object.fromEntries(
    new FormData(form).entries()
  );

  const now = new Date();

  return {
    idRegistro: currentRecordId || makeId(),

    fechaRegistro: now.toLocaleString('es-NI'),

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

/* =========================================================
   LLENAR FORMULARIO
   ========================================================= */

function fillForm(data) {
  const fields = [
    'nombres',
    'apellidos',
    'edad',
    'telefono',
    'correo',
    'region',
    'distrito',
    'iglesia',
    'pastor',
    'detalleMedico',
    'monto',
    'firmaLider',
    'dia',
    'mes'
  ];

  fields.forEach(name => {
    if (form.elements[name]) {
      form.elements[name].value = data[name] ?? '';
    }
  });

  [
    'talla',
    'cargo',
    'condicionMedica'
  ].forEach(name => {
    form
      .querySelectorAll(`input[name="${name}"]`)
      .forEach(box => {
        box.checked = box.value === (data[name] || '');
      });
  });
}

/* =========================================================
   VALIDAR
   ========================================================= */

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

/* =========================================================
   GUARDAR EN SUPABASE
   ========================================================= */

async function saveRecord() {
  if (!validate()) return;

  if (!supabaseReady()) {
    setStatus(
      'Error: Supabase no está configurado correctamente.',
      'error'
    );

    return;
  }

  const data = collectForm();
  const wasEditing = Boolean(currentRecordId);

  setStatus(
    'Guardando registro en la base de datos...',
    'info'
  );

  try {
    const { data: saved, error } =
      await window.supabaseClient
        .from('registros_vigilia')
        .upsert(data, {
          onConflict: 'idRegistro'
        })
        .select()
        .single();

    if (error) {
      console.error('SUPABASE ERROR:', error);

      setStatus(
        'Error al guardar: ' + error.message,
        'error'
      );

      return;
    }

    if (!saved) {
      setStatus(
        'El registro fue procesado, pero Supabase no devolvió los datos.',
        'error'
      );

      return;
    }

    currentRecordId = saved.idRegistro;

    history.replaceState(
      {},
      '',
      `index.html?id=${encodeURIComponent(saved.idRegistro)}`
    );

    setStatus(
      wasEditing
        ? `Registro ${saved.idRegistro} actualizado correctamente.`
        : `Registro guardado correctamente: ${saved.idRegistro}`,
      'ok'
    );

    alert(
      wasEditing
        ? 'Registro actualizado correctamente.\n\nID: ' +
          saved.idRegistro
        : 'Registro guardado correctamente.\n\nID: ' +
          saved.idRegistro
    );

  } catch (error) {
    console.error('ERROR:', error);

    setStatus(
      'Ocurrió un error inesperado al guardar.',
      'error'
    );
  }
}

/* =========================================================
   NUEVA FICHA
   ========================================================= */

function newForm() {
  currentRecordId = null;

  if (form) {
    form.reset();
  }

  if (sheet) {
    sheet.classList.remove('preview-mode');
  }

  setStatus(
    'Nueva ficha lista para llenar.',
    'info'
  );

  history.replaceState(
    {},
    '',
    'index.html'
  );
}

/* =========================================================
   CARGAR REGISTRO
   ========================================================= */

async function loadRecord(id) {
  if (!supabaseReady()) {
    setStatus(
      'Error: Supabase no está configurado correctamente.',
      'error'
    );

    return;
  }

  setStatus(
    'Cargando registro...',
    'info'
  );

  try {
    const { data, error } =
      await window.supabaseClient
        .from('registros_vigilia')
        .select('*')
        .eq('idRegistro', id)
        .single();

    if (error) {
      console.error('SUPABASE ERROR:', error);

      setStatus(
        'No se encontró ese registro.',
        'error'
      );

      return;
    }

    if (!data) {
      setStatus(
        'No se encontró ese registro.',
        'error'
      );

      return;
    }

    currentRecordId = data.idRegistro;

    fillForm(data);

    if (sheet) {
      sheet.classList.add('preview-mode');
    }

    setStatus(
      `Registro ${id} cargado. Puedes editarlo o imprimirlo.`,
      'info'
    );

  } catch (error) {
    console.error('ERROR:', error);

    setStatus(
      'Error al cargar el registro.',
      'error'
    );
  }
}

/* =========================================================
   BOTONES
   ========================================================= */

const btnPreview =
  document.getElementById('btnPreview');

if (btnPreview) {
  btnPreview.onclick = () => {
    if (sheet) {
      sheet.classList.add('preview-mode');
    }

    setStatus(
      'Vista previa activada.',
      'info'
    );
  };
}

const btnEdit =
  document.getElementById('btnEdit');

if (btnEdit) {
  btnEdit.onclick = () => {
    if (sheet) {
      sheet.classList.remove('preview-mode');
    }

    setStatus(
      'Modo edición activado.',
      'info'
    );
  };
}

const btnPrint =
  document.getElementById('btnPrint');

if (btnPrint) {
  btnPrint.onclick = () => {
    window.print();
  };
}

const btnSave =
  document.getElementById('btnSave');

if (btnSave) {
  btnSave.onclick = saveRecord;
}

const btnClear =
  document.getElementById('btnClear');

if (btnClear) {
  btnClear.onclick = () => {
    if (
      confirm(
        '¿Crear una nueva ficha? Los registros ya guardados no se borrarán.'
      )
    ) {
      newForm();
    }
  };
}

const btnRecords =
  document.getElementById('btnRecords');

if (btnRecords) {
  btnRecords.onclick = () => {
    location.href = 'registros.html';
  };
}

/* =========================================================
   INICIO
   ========================================================= */

if (form) {
  enforceSingleCheckboxGroups();

  const params =
    new URLSearchParams(location.search);

  const id = params.get('id');

  if (id) {
    loadRecord(id);
  } else {
    setStatus(
      'Nueva ficha. Los registros se guardarán en la base de datos.',
      'info'
    );
  }
}
