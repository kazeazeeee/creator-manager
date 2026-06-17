async function test() {
  try {
    const res = await fetch("https://countik.com/api/user/info?username=urufachan");
    const json = await res.json();
    console.log("Countik Response:", json);
  } catch (e) {
    console.error("Countik failed:", e.message);
  }
}
test();
