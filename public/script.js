// import CodeRadio from "../coderadio-package";

const audio = document.querySelector("#aud");
const radio = new CodeRadio(audio);

document.querySelector("#play").addEventListener("click", () => {
  radio.play();
});
