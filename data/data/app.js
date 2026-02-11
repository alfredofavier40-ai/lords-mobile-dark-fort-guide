let tipoFortaleza = '';
let tipoArmadura = '';
let modeloFortaleza;
let modeloArmadura;

// Cargar modelos TensorFlow.js
async function cargarModelos() {
  modeloFortaleza = await tf.loadLayersModel('model/fortaleza/model.json');
  modeloArmadura = await tf.loadLayersModel('model/armadura/model.json');
}
cargarModelos();

// Función para procesar fortaleza
async function procesarFortaleza() {
  const input = document.getElementById('fortalezaImg');
  if (input.files.length === 0) return alert("Selecciona una imagen de fortaleza");
  
  const file = input.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const tensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([224,224])
                    .toFloat()
                    .expandDims();
    const pred = modeloFortaleza.predict(tensor);
    const clases = ["inf", "range", "cav"];
    const index = pred.argMax(1).dataSync()[0];
    tipoFortaleza = clases[index];
    alert("Fortaleza detectada: " + tipoFortaleza.toUpperCase());
  };
}

// Función para procesar armaduras
async function procesarArmadura() {
  const input = document.getElementById('armaduraImg');
  if (input.files.length === 0) return alert("Selecciona una imagen de tus armaduras");
  
  const file = input.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const tensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([224,224])
                    .toFloat()
                    .expandDims();
    const pred = modeloArmadura.predict(tensor);
    const clases = ["inf", "range", "cav", "mixed"];
    const index = pred.argMax(1).dataSync()[0];
    tipoArmadura = clases[index];
    alert("Armadura detectada: " + tipoArmadura.toUpperCase());
  };
}

// Función para calcular ataque
function calcular() {
  if (!tipoFortaleza) return alert("Primero analiza la fortaleza");
  if (!tipoArmadura) return alert("Primero analiza tu armadura");

  const player = document.getElementById("player").value;
  const tropas = document.getElementById("tropas").value;

  // Determinar counter y formación
  let counter = nests[tipoFortaleza].counter;
  let form = nests[tipoFortaleza].formation;
  let selectedHeroes = heroes[player][counter];

  // Verificar armadura
  let gearBonus = "";
  if (tipoArmadura === counter || tipoArmadura === "mixed")
    gearBonus = "✔ Tu armadura es correcta para el ataque";
  else
    gearBonus = "⚠ Cambia a set " + counter + " para ventaja máxima";

  // Mostrar resultado estético
  document.getElementById("resultado").innerHTML = `
    <h2>Resultado del Ataque</h2>
    <p><strong>Tropas a enviar:</strong> ${counter.toUpperCase()} (${tropas.toUpperCase()})</p>
    <p><strong>Formación:</strong> ${form}</p>
    <p><strong>Héroes recomendados:</strong><br>${selectedHeroes.join("<br>")}</p>
    <p><strong>Armadura:</strong> ${gearBonus}</p>
  `;
}
