(async () => {
  try {
    const response = await fetch("https://trsp-nbg.github.io/matrix/version.json");
    const { latestVersion } = await response.json();

    if (latestVersion > appVersion) {
      const button = document.getElementById("update-button");
      button.style.display = "inline-block";
      button.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = "https://www.dropbox.com/scl/fi/f3p096n3rskjkb1gyzqyw/Matrix.zip?rlkey=w01846w0zs62s8ydnn7pyh91m&st=k1f50oag&dl=1";
        link.download = "Matrix.zip";
        link.click();
      });
    }
  } catch (err) {
    console.error("Update check failed:", err);
  }
})();

