document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ app.js cargado");

  // =====================================================
  // SUPABASE
  // =====================================================

  if (!window.supabaseClient) {
    console.error("❌ Supabase no está configurado");
    alert("Error: Supabase no está configurado correctamente.");
    return;
  }

  const supabase = window.supabaseClient;

  // =====================================================
  // ELEMENTOS DEL HTML
  // =====================================================

  const form = document.getElementById("registrationForm");

  const btnPreview = document.getElementById("btnPreview");
  const btnEdit = document.getElementById("btnEdit");
  const btnSave = document.getElementById("btnSave");
  const btnPrint = document.getElementById("btnPrint");
  const btnClear = document.getElementById("btnClear");
  const btnRecords = document.getElementById("btnRecords");

  const recordStatus = document.getElementById("recordStatus");

  let currentRecordId = null;

  // =====================================================
  // UTILIDADES
  // =====================================================

  function setStatus(text) {
    if (recordStatus) {
      recordStatus.textContent = text;
    }

    console.log(text);
  }

  function makeId() {

    const now = new Date();

    return (
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0") +
      "-" +
      Math.random().toString(36).substring(2, 7)
    );
  }

  function getValue(name) {

    const element = form.querySelector(`[name="${name}"]`);

    return element ? element.value.trim() : "";
  }

  function getCheckedValue(name) {

    const element = form.querySelector(
      `input[name="${name}"]:checked`
    );

    return element ? element.value : "";
  }

  // =====================================================
  // CHECKBOXES DE SELECCIÓN ÚNICA
  // =====================================================

  const singleGroups = [
    "talla",
    "cargo",
    "condicionMedica"
  ];

  singleGroups.forEach((group) => {

    const checkboxes = form.querySelectorAll(
      `input[name="${group}"]`
    );

    checkboxes.forEach((checkbox) => {

      checkbox.addEventListener("change", () => {

        if (checkbox.checked) {

          checkboxes.forEach((other) => {

            if (other !== checkbox) {
              other.checked = false;
            }

          });

        }

      });

    });

  });

  // =====================================================
  // RECOPILAR DATOS
  // =====================================================

  function collectForm() {

    const now = new Date();

    return {

      idRegistro:
        currentRecordId || makeId(),

      fechaRegistro:
        `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,

      nombres:
        getValue("nombres"),

      apellidos:
        getValue("apellidos"),

      edad:
        getValue("edad"),

      telefono:
        getValue("telefono"),

      correo:
        getValue("correo"),

      talla:
        getCheckedValue("talla"),

      region:
        getValue("region"),

      distrito:
        getValue("distrito"),

      iglesia:
        getValue("iglesia"),

      pastor:
        getValue("pastor"),

      cargo:
        getCheckedValue("cargo"),

      condicionMedica:
        getCheckedValue("condicionMedica"),

      detalleMedico:
        getValue("detalleMedico"),

      monto:
        getValue("monto"),

      firmaLider:
        getValue("firmaLider"),

      dia:
        getValue("dia"),

      mes:
        getValue("mes"),

      anio:
        "2026"
    };
  }

  // =====================================================
  // GUARDAR
  // =====================================================

  async function saveRecord() {

    try {

      setStatus("Guardando...");

      const data = collectForm();

      console.log("📤 Enviando a Supabase:", data);

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

        console.error("❌ Error Supabase:", error);

        setStatus("Error al guardar");

        alert(
          "❌ No se pudo guardar:\n\n" +
          error.message
        );

        return;
      }

      currentRecordId = result.idRegistro;

      console.log("✅ Registro guardado:", result);

      setStatus(
        "Registro guardado: " +
        currentRecordId
      );

      alert(
        "✅ ¡Registro guardado correctamente!"
      );

    } catch (error) {

      console.error("❌ Error:", error);

      setStatus("Error");

      alert(
        "❌ Error inesperado:\n\n" +
        error.message
      );

    }

  }

  // =====================================================
  // VISTA PREVIA
  // =====================================================

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
        "❌ No se pudo generar la vista previa."
      );

    }

  }

  // =====================================================
  // IMPRIMIR
  // =====================================================

  function printRecord() {

    if (!currentRecordId) {

      alert(
        "Primero guarda el registro antes de imprimirlo."
      );

      return;
    }

    window.open(
      "imprimir.html?ids=" +
      encodeURIComponent(currentRecordId),
      "_blank"
    );

  }

  // =====================================================
  // LIMPIAR
  // =====================================================

  function clearForm() {

    if (!confirm(
      "¿Deseas limpiar la ficha y comenzar un nuevo registro?"
    )) {
      return;
    }

    form.reset();

    currentRecordId = null;

    setStatus(
      "Nueva ficha lista"
    );

  }

  // =====================================================
  // EDITAR
  // =====================================================

  async function editRecord() {

    const id = prompt(
      "Introduce el ID del registro que deseas editar:"
    );

    if (!id) {
      return;
    }

    await loadRecord(id.trim());

  }

  // =====================================================
  // CARGAR REGISTRO
  // =====================================================

  async function loadRecord(id) {

    try {

      setStatus(
        "Cargando registro..."
      );

      const { data, error } = await supabase
        .from("registros_vigilia")
        .select("*")
        .eq("idRegistro", id)
        .single();

      if (error) {

        console.error(error);

        alert(
          "❌ No se encontró el registro:\n\n" +
          error.message
        );

        return;
      }

      currentRecordId = data.idRegistro;

      form.querySelector('[name="nombres"]').value =
        data.nombres || "";

      form.querySelector('[name="apellidos"]').value =
        data.apellidos || "";

      form.querySelector('[name="edad"]').value =
        data.edad || "";

      form.querySelector('[name="telefono"]').value =
        data.telefono || "";

      form.querySelector('[name="correo"]').value =
        data.correo || "";

      form.querySelector('[name="region"]').value =
        data.region || "";

      form.querySelector('[name="distrito"]').value =
        data.distrito || "";

      form.querySelector('[name="iglesia"]').value =
        data.iglesia || "";

      form.querySelector('[name="pastor"]').value =
        data.pastor || "";

      form.querySelector('[name="detalleMedico"]').value =
        data.detalleMedico || "";

      form.querySelector('[name="monto"]').value =
        data.monto || "";

      form.querySelector('[name="firmaLider"]').value =
        data.firmaLider || "";

      form.querySelector('[name="dia"]').value =
        data.dia || "";

      form.querySelector('[name="mes"]').value =
        data.mes || "";

      // TALLA
      form
        .querySelectorAll('input[name="talla"]')
        .forEach((checkbox) => {
          checkbox.checked =
            checkbox.value === data.talla;
        });

      // CARGO
      form
        .querySelectorAll('input[name="cargo"]')
        .forEach((checkbox) => {
          checkbox.checked =
            checkbox.value === data.cargo;
        });

      // CONDICIÓN MÉDICA
      form
        .querySelectorAll('input[name="condicionMedica"]')
        .forEach((checkbox) => {
          checkbox.checked =
            checkbox.value === data.condicionMedica;
        });

      setStatus(
        "Editando registro " +
        currentRecordId
      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error cargando registro:\n\n" +
        error.message
      );

    }

  }

  // =====================================================
  // EVENTOS
  // =====================================================

  if (btnSave) {

    btnSave.addEventListener(
      "click",
      saveRecord
    );

  }

  if (btnPreview) {

    btnPreview.addEventListener(
      "click",
      previewRecord
    );

  }

  if (btnEdit) {

    btnEdit.addEventListener(
      "click",
      editRecord
    );

  }

  if (btnPrint) {

    btnPrint.addEventListener(
      "click",
      printRecord
    );

  }

  if (btnClear) {

    btnClear.addEventListener(
      "click",
      clearForm
    );

  }

  if (btnRecords) {

    btnRecords.addEventListener(
      "click",
      () => {

        window.location.href =
          "registros.html";

      }
    );

  }

  // =====================================================
  // FORMULARIO
  // =====================================================

  form.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      saveRecord();

    }
  );

  // =====================================================
  // INICIO
  // =====================================================

  setStatus(
    "Sistema listo"
  );

  console.log(
    "🚀 Sistema Vigilia Procesos 2026 iniciado"
  );

});
