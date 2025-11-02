document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form[action='/signup']");
  if (form) {
    const submitBtn = form.querySelector("button[type='submit']");
    form.addEventListener("submit", function () {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-disabled", "true");
      }
    });
  }

  if (window.message && window.message.trim() !== "") {
    Swal.fire({
      title: `🎉 ${window.message}`,
      text: "Redirecting to your Sign In page...",
      icon: "success",
      showConfirmButton: false,
      timer: 2000
    }).then(() => {
      window.location.href = "/signin";
    });
  }

  if (window.error && window.error.trim() !== "") {
    Swal.fire({
      title: "⚠️ Signup Failed",
      text: window.error,
      icon: "error",
      confirmButtonText: "Try Again"
    });
  }
});

