(async () => {
  try {
    const response = await fetch("https://trsp-nbg.github.io/matrix/version.json");
    const { latestVersion } = await response.json();

    if (latestVersion > appVersion) {
      const button = document.getElementById("update-button");
      button.style.display = "inline-block";
      button.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = "https://www.dropbox.com/scl/fi/5he6sikutgghfj1izm4kg/Matrix.zip?rlkey=rbfg8a4rtdxv8zb8mb651wx9d&st=fky7bqng&dl=1";
        link.download = "Matrix.zip";
        link.click();
      });
    }
  } catch (err) {
    console.error("Update check failed:", err);
  }
})();
//new try 6
