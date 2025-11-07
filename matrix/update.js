(async () => {
  try {
    const response = await fetch("https://trsp-nbg.github.io/matrix/version.json");
    const { latestVersion } = await response.json();

    if (latestVersion > appVersion) {
      const button = document.getElementById("update-button");
      button.style.display = "inline-block";
      button.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = "Dropbox-Link";
        link.download = "test.zip";
        link.click();
      });
    }
  } catch (err) {
    console.error("Update check failed:", err);
  }
})();
