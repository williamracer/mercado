let itens = [];
let ordenacaoAtual = {
    coluna: null,
    ordem: "asc" // Pode ser "asc" (ascendente) ou "desc" (descendente)
};

function adicionarItem() {
    const itemInput = document.getElementById("item");
    const precoInput = document.getElementById("preco");
    const quantidadeInput = document.getElementById("quantidade");

    const item = itemInput.value.trim().toLowerCase();
    const preco = parseFloat(precoInput.value) || 0; // Valor padrão 0 se não for válido
    const quantidade = parseFloat(quantidadeInput.value.replace(',', '.')) || 0; // Valor padrão 0 se não for válido

    if (item !== "" && preco > 0 && quantidade > 0) {
        const index = itens.findIndex((element) => element.item === item);
        if (index !== -1) {
            itens[index].quantidade += quantidade;
        } else {
            const novoItem = { item, preco, quantidade };
            itens.push(novoItem);
        }
        salvarNoLocalStorage();
        atualizarTabela();
        atualizarTotalGeral(); // Adicionado para atualizar o campo do total geral
        itemInput.value = "";
        precoInput.value = "";
        quantidadeInput.value = "";
    }
}

function verificarItemExistente() {
    const itemInput = document.getElementById("item");
    const sugestaoItem = document.querySelector(".mdl-menu__item");
    sugestaoItem.textContent = "";

    const itemDigitado = itemInput.value.trim().toLowerCase();
    const itensExistentes = itens.map((element) => element.item.toLowerCase());
    const itensSugeridos = itensExistentes.filter((element) => element.includes(itemDigitado));

    itensSugeridos.forEach((itemSugerido) => {
        const li = document.createElement("li");
        li.className = "mdl-menu__item";
        li.textContent = itemSugerido;
        li.onclick = () => {
            itemInput.value = itemSugerido;
            itemInput.focus();
        };
        sugestaoItem.appendChild(li);
    });
}

function salvarNoLocalStorage() {
    localStorage.setItem('itens', JSON.stringify(itens));
}

function carregarDoLocalStorage() {
    const itensSalvos = localStorage.getItem('itens');
    if (itensSalvos) {
        itens = JSON.parse(itensSalvos);
        atualizarTabela();
        atualizarTotalGeral(); // Adicionado para atualizar o campo do total geral
    }
}

function atualizarTabela() {
    const tabela = document.getElementById("tabela");
    tabela.innerHTML = `
        <thead>
            <tr>
                <th class="mdl-data-table__cell--non-numeric ${ordenacaoAtual.coluna === 'item' ? 'coluna-ordenada' : ''}">
                    <button class="mdl-button mdl-js-button" onclick="ordenarItens('item')">Item ${ordenacaoAtual.coluna === 'item' ? ordenacaoAtual.ordem === 'asc' ? '▲' : '▼' : ''}</button>
                </th>
                <th class="${ordenacaoAtual.coluna === 'preco' ? 'coluna-ordenada' : ''}">
                    <button class="mdl-button mdl-js-button" onclick="ordenarItens('preco')">Preço(R$) ${ordenacaoAtual.coluna === 'preco' ? ordenacaoAtual.ordem === 'asc' ? '▲' : '▼' : ''}</button>
                </th>
                <th class="${ordenacaoAtual.coluna === 'quantidade' ? 'coluna-ordenada' : ''}">
                    <button class="mdl-button mdl-js-button" onclick="ordenarItens('quantidade')">Quantidade ${ordenacaoAtual.coluna === 'quantidade' ? ordenacaoAtual.ordem === 'asc' ? '▲' : '▼' : ''}</button>
                </th>
                <th class="${ordenacaoAtual.coluna === 'total' ? 'coluna-ordenada' : ''}">
                    <button class="mdl-button mdl-js-button" onclick="ordenarItens('total')">Total(R$) ${ordenacaoAtual.coluna === 'total' ? ordenacaoAtual.ordem === 'asc' ? '▲' : '▼' : ''}</button>
                </th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${itens.map((item, index) => `
                <tr>
                    <td class="mdl-data-table__cell--non-numeric">${item.item}</td>
                    <td>${formatarMoeda(item.preco)}</td>
                    <td>${formatarQuantidade(item.quantidade)}</td>
                    <td>${formatarMoeda(item.preco * item.quantidade)}</td>
                    <td>
                        <button class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" onclick="editarItem(${index})">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" onclick="excluirItem(${index})">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    componentHandler.upgradeDom(); // Atualizar os componentes MDL na página
}

function ordenarItens(colunaOrdenacao) {
    if (ordenacaoAtual.coluna === colunaOrdenacao) {
        ordenacaoAtual.ordem = ordenacaoAtual.ordem === "asc" ? "desc" : "asc";
    } else {
        ordenacaoAtual.coluna = colunaOrdenacao;
        ordenacaoAtual.ordem = "asc";
    }

    switch (ordenacaoAtual.coluna) {
        case 'item':
            itens.sort((a, b) => a.item.localeCompare(b.item) * (ordenacaoAtual.ordem === "asc" ? 1 : -1));
            break;
        case 'preco':
            itens.sort((a, b) => (a.preco - b.preco) * (ordenacaoAtual.ordem === "asc" ? 1 : -1));
            break;
        case 'quantidade':
            itens.sort((a, b) => (a.quantidade - b.quantidade) * (ordenacaoAtual.ordem === "asc" ? 1 : -1));
            break;
        case 'total':
            itens.sort((a, b) => ((a.preco * a.quantidade) - (b.preco * b.quantidade)) * (ordenacaoAtual.ordem === "asc" ? 1 : -1));
            break;
        default:
            return;
    }
    atualizarTabela();
    atualizarTotalGeral(); // Adicionado para atualizar o campo do total geral
}

function editarItem(index) {
    const quantidadeNova = prompt("Digite a nova quantidade:", itens[index].quantidade);
    if (quantidadeNova !== null) {
        const novaQuantidade = parseFloat(quantidadeNova.replace(',', '.'));
        if (!isNaN(novaQuantidade) && novaQuantidade >= 0) {
            itens[index].quantidade = novaQuantidade;
            salvarNoLocalStorage();
            atualizarTabela();
            atualizarTotalGeral(); // Adicionado para atualizar o campo do total geral
        } else {
            alert("Quantidade inválida. A edição foi cancelada.");
        }
    }
}

function excluirItem(index) {
    if (confirm("Tem certeza que deseja excluir este item?")) {
        itens.splice(index, 1);
        salvarNoLocalStorage(); // Salvar os dados no localStorage após a exclusão
        atualizarTabela();
        atualizarTotalGeral(); // Atualizar o campo do total geral após a exclusão
    }
}

function formatarQuantidade(quantidade) {
    const valorFormatado = quantidade % 1 === 0 ? quantidade.toFixed(0) : quantidade.toFixed(2);
    return valorFormatado.replace('.', ',');
}

function formatarMoeda(valor) {
    return valor.toFixed(2).replace('.', ',');
}

function atualizarTotalGeral() {
    const totalGeralElement = document.getElementById("total-geral");
    let totalGeral = 0;
    itens.forEach((item) => {
        totalGeral += item.preco * item.quantidade;
    });
    totalGeralElement.textContent = `Total: R$ ${formatarMoeda(totalGeral)}`;
}

carregarDoLocalStorage();
