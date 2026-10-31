const Search = {
  query: "",
  onChange() {}
};

document.getElementById("search").oninput = e => {
  Search.query = e.target.value.toLowerCase();
  Search.onChange();
};

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const search = document.getElementById("search");
    search.focus();
    search.select();
  }
});