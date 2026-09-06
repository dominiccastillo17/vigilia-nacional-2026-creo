document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ app.js cargado");

  // =====================================================
  // SUPABASE
  // =====================================================

  if (!window.supabaseClient) {

    console.error("❌ Supabase no está configurado");

    alert(
      "Error: Supabase no está configurado correctamente."
    );

    return;
  }

  const supabase =
    window.supabaseClient;


  // =====================================================
  // ELEMENTOS DEL HTML
  // =====================================================

  const form =
    document.getElementById("registrationForm");

  const btnPreview =
    document.getElementById("btnPreview");

  const btnEdit =
    document.getElementById("btnEdit");

  const btnSave =
    document.getElementById("btnSave");

  const btnPrint =
    document.getElementById("btnPrint");

  const btnClear =
    document.getElementById("btnClear");

  const btnRecords =
    document.getElementById("btnRecords");

  const recordStatus =
    document.getElementById("recordStatus");


  // Verificación
  if (!form) {

    console.error(
      "❌ No se encontró #registrationForm"
    );

    alert(
      "Error: no se encontró el formulario de inscripción."
    );

    return;
  }


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

    const now =
      new Date();

    return (

      now.getFullYear() +

      String(
        now.getMonth() + 1
      ).padStart(2, "0") +

      String(
        now.getDate()
      ).padStart(2, "0") +

      "-" +

      String(
        now.getHours()
      ).padStart(2, "0") +

      String(
        now.getMinutes()
      ).padStart(2, "0") +

      String(
        now.getSeconds()
      ).padStart(2, "0") +

      "-" +

      Math.random()
        .toString(36)
        .substring(2, 7)

    );
  }


  function getValue(name) {

    const element =
      form.querySelector(
        `[name="${name}"]`
      );

    return element
      ? element.value.trim()
      : "";
  }


  function getCheckedValue(name) {

    const element =
      form.querySelector(
        `input[name="${name}"]:checked`
      );

    return element
      ? element.value
      : "";
  }


  // =====================================================
  // CHECKBOXES DE SELECCIÓN ÚNICA
  // =====================================================

  const singleGroups = [
    "talla",
    "cargo",
    "condicionMedica"
  ];


  singleGroups.forEach(
    (group) => {

      const checkboxes =
        form.querySelectorAll(
          `input[name="${group}"]`
        );


      checkboxes.forEach(
        (checkbox) => {

          checkbox.addEventListener(
            "change",
            () => {

              if (checkbox.checked) {

                checkboxes.forEach(
                  (other) => {

                    if (
                      other !== checkbox
                    ) {

                      other.checked =
                        false;

                    }

                  }
                );

              }

            }
          );

        }
      );

    }
  );


  // =====================================================
  // RECOPILAR DATOS
  // =====================================================

  function collectForm() {

    const now =
      new Date();

    return {

      idRegistro:
        currentRecordId ||
        makeId(),

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
        getCheckedValue(
          "condicionMedica"
        ),

      detalleMedico:
        getValue(
          "detalleMedico"
        ),

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

      setStatus(
        "Guardando..."
      );


      const data =
        collectForm();


      console.log(
        "📤 DATOS A GUARDAR:",
        data
      );


      // -------------------------------------------------
      // VALIDACIÓN BÁSICA
      // -------------------------------------------------

      if (
        !data.nombres ||
        !data.apellidos
      ) {

        alert(
          "⚠️ Debes ingresar al menos los nombres y apellidos."
        );

        setStatus(
          "Faltan datos obligatorios"
        );

        return;
      }


      // -------------------------------------------------
      // INSERTAR EN SUPABASE
      // -------------------------------------------------

      const {
        data: result,
        error
      } = await supabase

        .from(
          "registros_vigilia"
        )

        .insert([
          data
        ])

        .select()

        .single();


      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      if (error) {

        console.error(
          "❌ ERROR COMPLETO DE SUPABASE:",
          error
        );


        setStatus(
          "❌ Error al guardar"
        );


        alert(

          "❌ SUPABASE NO GUARDÓ EL REGISTRO\n\n" +

          "Mensaje:\n" +
          error.message +

          "\n\nCódigo:\n" +
          (
            error.code ||
            "Sin código"
          ) +

          "\n\nDetalle:\n" +
          (
            error.details ||
            "Sin detalle"
          )

        );


        return;
      }


      // -------------------------------------------------
      // SIN RESULTADO
      // -------------------------------------------------

      if (!result) {

        setStatus(
          "⚠️ Sin confirmación"
        );


        alert(
          "El registro fue enviado, pero Supabase no devolvió confirmación."
        );


        return;
      }


      // -------------------------------------------------
      // ÉXITO
      // -------------------------------------------------

      currentRecordId =
        result.idRegistro;


      console.log(
        "✅ REGISTRO GUARDADO:",
        result
      );


      setStatus(
        "✅ Registro guardado: " +
        currentRecordId
      );


      alert(

        "✅ ¡REGISTRO GUARDADO CORRECTAMENTE!\n\n" +

        "ID: " +
        currentRecordId

      );


    } catch (error) {

      console.error(
        "❌ ERROR INESPERADO:",
        error
      );


      setStatus(
        "❌ Error inesperado"
      );


      alert(

        "❌ ERROR INESPERADO\n\n" +

        (
          error.message ||
          error
        )

      );

    }

  }


  // =====================================================
  // VISTA PREVIA
  // =====================================================

  function previewRecord() {

    try {

      const data =
        collectForm();


      localStorage.setItem(
        "vigiliaPreview",
        JSON.stringify(data)
      );


      window.open(
        "imprimir.html?preview=1",
        "_blank"
      );


    } catch (error) {

      console.error(
        error
      );


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

      encodeURIComponent(
        currentRecordId
      ),

      "_blank"

    );

  }


  // =====================================================
  // LIMPIAR
  // =====================================================

  function clearForm() {

    if (
      !confirm(
        "¿Deseas limpiar la ficha y comenzar un nuevo registro?"
      )
    ) {

      return;

    }


    form.reset();


    currentRecordId =
      null;


    setStatus(
      "Nueva ficha lista"
    );

  }


  // =====================================================
  // EDITAR
  // =====================================================

  async function editRecord() {

    const id =
      prompt(
        "Introduce el ID del registro que deseas editar:"
      );


    if (!id) {
      return;
    }


    await loadRecord(
      id.trim()
    );

  }


  // =====================================================
  // CARGAR REGISTRO
  // =====================================================

  async function loadRecord(id) {

    try {

      setStatus(
        "Cargando registro..."
      );


      const {
        data,
        error
      } = await supabase

        .from(
          "registros_vigilia"
        )

        .select("*")

        .eq(
          "idRegistro",
          id
        )

        .single();


      if (error) {

        console.error(
          error
        );


        alert(

          "❌ No se encontró el registro:\n\n" +

          error.message

        );


        return;
      }


      currentRecordId =
        data.idRegistro;


      // DATOS PERSONALES

      form.querySelector(
        '[name="nombres"]'
      ).value =
        data.nombres || "";


      form.querySelector(
        '[name="apellidos"]'
      ).value =
        data.apellidos || "";


      form.querySelector(
        '[name="edad"]'
      ).value =
        data.edad || "";


      form.querySelector(
        '[name="telefono"]'
      ).value =
        data.telefono || "";


      form.querySelector(
        '[name="correo"]'
      ).value =
        data.correo || "";


      // IGLESIA

      form.querySelector(
        '[name="region"]'
      ).value =
        data.region || "";


      form.querySelector(
        '[name="distrito"]'
      ).value =
        data.distrito || "";


      form.querySelector(
        '[name="iglesia"]'
      ).value =
        data.iglesia || "";


      form.querySelector(
        '[name="pastor"]'
      ).value =
        data.pastor || "";


      // MÉDICO

      form.querySelector(
        '[name="detalleMedico"]'
      ).value =
        data.detalleMedico || "";


      // PAGO

      form.querySelector(
        '[name="monto"]'
      ).value =
        data.monto || "";


      form.querySelector(
        '[name="firmaLider"]'
      ).value =
        data.firmaLider || "";


      form.querySelector(
        '[name="dia"]'
      ).value =
        data.dia || "";


      form.querySelector(
        '[name="mes"]'
      ).value =
        data.mes || "";


      // -------------------------------------------------
      // TALLA
      // -------------------------------------------------

      form
        .querySelectorAll(
          'input[name="talla"]'
        )
        .forEach(
          (checkbox) => {

            checkbox.checked =
              checkbox.value ===
              data.talla;

          }
        );


      // -------------------------------------------------
      // CARGO
      // -------------------------------------------------

      form
        .querySelectorAll(
          'input[name="cargo"]'
        )
        .forEach(
          (checkbox) => {

            checkbox.checked =
              checkbox.value ===
              data.cargo;

          }
        );


      // -------------------------------------------------
      // CONDICIÓN MÉDICA
      // -------------------------------------------------

      form
        .querySelectorAll(
          'input[name="condicionMedica"]'
        )
        .forEach(
          (checkbox) => {

            checkbox.checked =
              checkbox.value ===
              data.condicionMedica;

          }
        );


      setStatus(

        "Editando registro " +

        currentRecordId

      );


    } catch (error) {

      console.error(
        error
      );


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
