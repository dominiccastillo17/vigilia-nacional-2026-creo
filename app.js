// =====================================================
// VIGILIA NACIONAL PROCESOS 2026
// APP.JS
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  console.log("app.js cargado correctamente");

  // ---------------------------------------------------
  // ELEMENTOS
  // ---------------------------------------------------

  const form = document.getElementById("registroForm");

  const btnGuardar = document.getElementById("btnGuardar");
  const btnVistaPrevia = document.getElementById("btnVistaPrevia");
  const btnEditar = document.getElementById("btnEditar");
  const btnImprimir = document.getElementById("btnImprimir");
  const btnLimpiar = document.getElementById("btnLimpiar");
  const btnRegistros = document.getElementById("btnRegistros");

  // ---------------------------------------------------
  // COMPROBAR SUPABASE
  // ---------------------------------------------------

  if (!window.supabaseClient) {
    console.error("Supabase no está configurado.");
    alert("Error: Supabase no está configurado correctamente.");
    return;
  }

  const supabase = window.supabaseClient;

  // ---------------------------------------------------
  // ESTADO
  // ---------------------------------------------------

  let currentRecordId = null;

  // ---------------------------------------------------
  // UTILIDADES
  // ---------------------------------------------------

  function makeId() {
    const now = new Date();

    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      "-" +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0")
    );
  }

  function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
  }

  function setValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.value = value ?? "";
    }
  }

  function getChecked(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
  }

  function setStatus(message) {
    const status = document.getElementById("status");

    if (status) {
      status.textContent = message;
    } else {
      console.log(message);
    }
  }

  // ---------------------------------------------------
  // CHECKBOXES
  // ---------------------------------------------------

  const medicalCheckboxes = document.querySelectorAll(
    'input[type="checkbox"][name="condicionMedica"]'
  );

  medicalCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {

      if (checkbox.checked) {
        medicalCheckboxes.forEach((other) => {
          if (other !== checkbox) {
            other.checked = false;
          }
        });
      }

    });
  });

  // ---------------------------------------------------
  // RECOPILAR FORMULARIO
  // ---------------------------------------------------

  function collectForm() {

    const now = new Date();

    let condicionMedica = "";

    const checkedMedical = document.querySelector(
      'input[type="checkbox"][name="condicionMedica"]:checked'
    );

    if (checkedMedical) {
      condicionMedica = checkedMedical.value;
    }

    return {

      idRegistro: currentRecordId || makeId(),

      fechaRegistro:
        `${now.getDate()}/` +
        `${now.getMonth() + 1}/` +
        `${now.getFullYear()}`,

      nombres: getValue("nombres"),

      apellidos: getValue("apellidos"),

      edad: getValue("edad"),

      telefono: getValue("telefono"),

      correo: getValue("correo"),

      talla: getValue("talla"),

      region: getValue("region"),

      distrito: getValue("distrito"),

      iglesia: getValue("iglesia"),

      pastor: getValue("pastor"),

      cargo: getValue("cargo"),

      condicionMedica: condicionMedica,

      detalleMedico: getValue("detalleMedico"),

      monto: getValue("monto"),

      firmaLider: getValue("firmaLider"),

      dia: getValue("dia"),

      mes: getValue("mes"),

      anio: getValue("anio")
    };
  }

  // ---------------------------------------------------
  // GUARDAR
  // ---------------------------------------------------

  async function saveRecord() {

    try {

      setStatus("Guardando...");

      const data = collectForm();

      console.log("Datos que se enviarán:", data);

      const { data: result, error } = await supabase
        .from("registros_vigilia")
        .upsert(
          data,
          {
            onConflict: "idRegistro"
          }
        )
        .select()
        .single();

      if (error) {

        console.error("Error de Supabase:", error);

        alert(
          "No se pudo guardar el registro:\n\n" +
          error.message
        );

        setStatus("Error al guardar");

        return;
      }

      currentRecordId = result.idRegistro;

      console.log("Registro guardado:", result);

      setStatus("Registro guardado correctamente");

      alert("✅ Registro guardado correctamente.");

    } catch (error) {

      console.error("Error inesperado:", error);

      alert(
        "Error inesperado:\n\n" +
        error.message
      );

      setStatus("Error");

    }
  }

  // ---------------------------------------------------
  // VISTA PREVIA
  // ---------------------------------------------------

  function previewRecord() {

    try {

      const data = collectForm();

      localStorage.setItem(
        "vigiliaPreview",
        JSON.stringify(data)
      );

      window.open(
        "imprimir.html?preview=1",
        "_blank"
      );

    } catch (error) {

      console.error(error);

      alert(
        "No se pudo generar la vista previa."
      );

    }
  }

  // ---------------------------------------------------
  // EDITAR
  // ---------------------------------------------------

  function editRecord() {

    const id = prompt(
      "Escribe el ID del registro que deseas editar:"
    );

    if (!id) return;

    loadRecord(id);
  }

  // ---------------------------------------------------
  // CARGAR REGISTRO
  // ---------------------------------------------------

  async function loadRecord(id) {

    try {

      setStatus("Cargando registro...");

      const { data, error } = await supabase
        .from("registros_vigilia")
        .select("*")
        .eq("idRegistro", id)
        .single();

      if (error) {

        console.error(error);

        alert(
          "No se encontró el registro:\n\n" +
          error.message
        );

        return;
      }

      currentRecordId = data.idRegistro;

      setValue("nombres", data.nombres);
      setValue("apellidos", data.apellidos);
      setValue("edad", data.edad);
      setValue("telefono", data.telefono);
      setValue("correo", data.correo);
      setValue("talla", data.talla);
      setValue("region", data.region);
      setValue("distrito", data.distrito);
      setValue("iglesia", data.iglesia);
      setValue("pastor", data.pastor);
      setValue("cargo", data.cargo);
      setValue("detalleMedico", data.detalleMedico);
      setValue("monto", data.monto);
      setValue("firmaLider", data.firmaLider);
      setValue("dia", data.dia);
      setValue("mes", data.mes);
      setValue("anio", data.anio);

      document
        .querySelectorAll(
          'input[type="checkbox"][name="condicionMedica"]'
        )
        .forEach((checkbox) => {

          checkbox.checked =
            checkbox.value === data.condicionMedica;

        });

      setStatus(
        "Editando registro " +
        data.idRegistro
      );

    } catch (error) {

      console.error(error);

      alert(
        "Error cargando registro:\n\n" +
        error.message
      );

    }
  }

  // ---------------------------------------------------
  // IMPRIMIR
  // ---------------------------------------------------

  function printRecord() {

    const id =
      currentRecordId ||
      getValue("idRegistro");

    if (id) {

      window.open(
        "imprimir.html?ids=" +
        encodeURIComponent(id),
        "_blank"
      );

    } else {

      alert(
        "Primero guarda el registro."
      );

    }
  }

  // ---------------------------------------------------
  // LIMPIAR
  // ---------------------------------------------------

  function clearForm() {

    if (form) {
      form.reset();
    }

    currentRecordId = null;

    setStatus("Formulario limpio");

    document
      .querySelectorAll(
        'input[type="checkbox"][name="condicionMedica"]'
      )
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

  }

  // ---------------------------------------------------
  // EVENTOS
  // ---------------------------------------------------

  if (form) {

    form.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        saveRecord();

      }
    );

  }

  if (btnGuardar) {
    btnGuardar.addEventListener(
      "click",
      saveRecord
    );
  }

  if (btnVistaPrevia) {
    btnVistaPrevia.addEventListener(
      "click",
      previewRecord
    );
  }

  if (btnEditar) {
    btnEditar.addEventListener(
      "click",
      editRecord
    );
  }

  if (btnImprimir) {
    btnImprimir.addEventListener(
      "click",
      printRecord
    );
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener(
      "click",
      clearForm
    );
  }

  if (btnRegistros) {

    btnRegistros.addEventListener(
      "click",
      () => {

        window.location.href =
          "registros.html";

      }
    );

  }

  // ---------------------------------------------------
  // INICIO
  // ---------------------------------------------------

  console.log(
    "✅ Sistema de Vigilia iniciado correctamente"
  );

});
