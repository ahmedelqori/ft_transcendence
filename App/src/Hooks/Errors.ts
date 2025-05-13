class HandleErrors {
  constructor() {
    this.handleErrorImage();
  }

  handleErrorImage() {
    window.addEventListener(
      "error",
      function (e) {
        const target: any = e.target;

        if (target.tagName === "IMG" && !target.dataset.defaulted) {
          target.src = "/assets/default.webp";
          target.dataset.defaulted = "true";
        }
      },
      true
    );
  }
}

const handleErrors = new HandleErrors();
export default handleErrors;
