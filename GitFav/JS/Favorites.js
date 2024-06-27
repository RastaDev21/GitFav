import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já favoritado");
      }

      const user = await GithubUser.search(username);
      if (user.login === undefined) {
        throw new Error("Usuário não encontrado");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    );
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");

      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach(user => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
     
            <td class="user">
              <img
                src="https://github.com/rastadev21.png"
                alt="Imagem de RastaDev21"
              />
              <a href="https://github.com/rastadev21" target="_blank">
                <p>RastaDev21</p>
                <span>rastadev21</span>
              </a>
            </td>
            <td class="repositories">21</td>
            <td class="followers">21000</td>
            <td>
              <button class="remove">
                <span class="remove">Remover</span>
              </button>
            </td>
    `;

    return tr;
  }

  // removeAllTr() {
  //   this.tbody.querySelectorAll("tr").forEach(tr => {
  //     tr.remove();
  //   });
  // }

  removeAllTr() {
    const emptyState = document.querySelector(".page-home");
    if (this.entries.length) emptyState.style.display = "none";
    else emptyState.style.display = "";

    this.tbody.querySelectorAll("tr").forEach(tr => tr.remove());
  }
}
