const pageUrl = `${window.location.protocol}//${window.location.host}/`


var onloadCallback = async function() {
  const res = await fetch(`${pageUrl}key`);
  const { key } = await res.json();

  grecaptcha.render("root", {
    sitekey: key,
    callback: verifyCallback,
  })
}

const verifyCallback = (res) => {
  console.log(res);
  const currentUrl = new URL(window.location.href)
  const valID = currentUrl.searchParams.get("valID")

  if (valID) {
    const redirectUrl = `${pageUrl}val?token=${res}&valID=${valID}`
    window.location.replace(redirectUrl)
  }
}
