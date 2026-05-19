
// function openSidebar() {
//     var side = document.getElementById('sidebar');
//     side.style.display = (side.style.display === "block") ? "none" : "block";
// }

// function closeSidebar() {
//     document.getElementById('sidebar').style.display = 'none';
// }


function openForm() {
    var form = document.getElementById("transaction-form")
    form.style.display = (form.style.display === "block") ? "none" : "block";
}

function closeForm() {
    document.getElementById("transaction-form").style.display = "none";
}


let transactions = [];
const TRANSACTIONS_STORAGE_KEY = "bizTrackTransactions";
const DEFAULT_TRANSACTIONS = [
    {
        trID: 1,
        trDate: "2024-01-05",
        trCategory: "Rent",
        trAmount: 100.00,
        trNotes: "January Rent"
    },
    {
        trID: 2,
        trDate: "2024-01-15",
        trCategory: "Order Fulfillment",
        trAmount: 35.00,
        trNotes: "Order #1005"
    },
    {
        trID: 3,
        trDate: "2024-01-08",
        trCategory: "Utilities",
        trAmount: 120.00,
        trNotes: "Internet"
    },
    {
        trID: 4,
        trDate: "2024-02-05",
        trCategory: "Supplies",
        trAmount: 180.00,
        trNotes: "Embroidery Machine"
    },
    {
        trID: 5,
        trDate: "2024-01-25",
        trCategory: "Miscellaneous",
        trAmount: 20.00,
        trNotes: "Pizza"
    },
];

function normalizeTransactionId(value) {
    const numericId = Number(value);

    if (!Number.isInteger(numericId) || numericId <= 0) {
        return null;
    }

    return numericId;
}

function getNextTransactionId(transactionList) {
    const maxId = transactionList.reduce((currentMax, transaction) => {
        const normalizedId = normalizeTransactionId(transaction.trID);
        return normalizedId === null ? currentMax : Math.max(currentMax, normalizedId);
    }, 0);

    return maxId + 1;
}

function getNextUnusedTransactionId(usedIds) {
    let candidateId = 1;

    while (usedIds.has(candidateId)) {
        candidateId += 1;
    }

    return candidateId;
}

function ensureUniqueTransactionIds(transactionList) {
    const usedIds = new Set();

    return transactionList.map(transaction => {
        const originalId = normalizeTransactionId(transaction.trID);

        if (originalId !== null && !usedIds.has(originalId)) {
            usedIds.add(originalId);
            return { ...transaction, trID: originalId };
        }

        const repairedId = getNextUnusedTransactionId(usedIds);
        usedIds.add(repairedId);
        return { ...transaction, trID: repairedId };
    });
}

function loadTransactions() {
    const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

    if (!storedTransactions) {
        return ensureUniqueTransactionIds([...DEFAULT_TRANSACTIONS]);
    }

    try {
        const parsedTransactions = JSON.parse(storedTransactions);
        return Array.isArray(parsedTransactions)
            ? ensureUniqueTransactionIds(parsedTransactions)
            : ensureUniqueTransactionIds([...DEFAULT_TRANSACTIONS]);
    } catch (error) {
        console.warn("Invalid transaction data found in localStorage.", error);
        return ensureUniqueTransactionIds([...DEFAULT_TRANSACTIONS]);
    }
}

function saveTransactions(transactionList) {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactionList));
}

window.onload = function () {
    transactions = loadTransactions();
    saveTransactions(transactions);
  
    renderTransactions(transactions);
}

function addOrUpdate(event) {
    let type = document.getElementById("submitBtn").textContent;
    if (type === 'Add') {
        newTransaction(event);
    } else if (type === 'Update'){
        const trId = document.getElementById("tr-id").value;
        updateTransaction(trId);
    }

    return Math.max(currentMax, normalizedId);
  }, 0);

  return maxId + 1;
}

/**
 * Finds the next unused transaction ID given a set of already-used IDs.
 *
 * Data migration rationale:
 * This helper is used when repairing persisted localStorage data. If a record
 * has a duplicate or invalid ID, it receives the next unused positive integer.
 * The algorithm is deterministic and preserves as many original IDs as
 * possible.
 *
 * @param {Set<number>} usedIds - IDs that are already assigned.
 * @returns {number} The next unused positive integer ID.
 */
function getNextUnusedTransactionId(usedIds) {
  let candidateId = 1;

  while (usedIds.has(candidateId)) {
    candidateId += 1;
  }

function newTransaction(event) {
    event.preventDefault();
    const trDate = document.getElementById("tr-date").value;
    const trCategory = document.getElementById("tr-category").value;
    const trAmount = parseFloat(document.getElementById("tr-amount").value);
    const trNotes = document.getElementById("tr-notes").value;

    const trID = getNextTransactionId(transactions);
    
    const transaction = {
      trID,
      trDate,
      trCategory,
      trAmount,
      trNotes,
    };
    
    transactions.push(transaction);
  
    transactions = ensureUniqueTransactionIds(transactions);
    saveTransactions(transactions);
    renderTransactions(transactions);

    displayExpenses();
  
    document.getElementById("transaction-form").reset();
}

function newTransaction(event) {
  event.preventDefault();

  const trDate = document.getElementById("tr-date").value;
  const trCategory = document.getElementById("tr-category").value;
  const trAmount = parseFloat(document.getElementById("tr-amount").value);
  const trNotes = document.getElementById("tr-notes").value;

  /*
   * DATA INTEGRITY FIX:
   * The original implementation used `transactions.length + 1`, which can
   * create duplicate IDs after a middle record is deleted. The revised
   * implementation derives the next ID from the maximum existing valid ID.
   */
  const trID = getNextTransactionId(transactions);

  const transaction = {
    trID,
    trDate,
    trCategory,
    trAmount,
    trNotes,
  };

  transactions.push(transaction);

  /*
   * Defensive step:
   * Although getNextTransactionId() should produce a unique ID, the list is
   * normalized again before persistence. This protects the application if
   * localStorage was modified externally while the page was open.
   */
  transactions = ensureUniqueTransactionIds(transactions);
  saveTransactions(transactions);

  renderTransactions(transactions);

  document.getElementById("transaction-form").reset();
}

function renderTransactions(transactions) {
  const transactionTableBody = document.getElementById("tableBody");

  /*
   * SECURITY FIX:
   * The original transaction table was generated with `innerHTML`, and
   * transaction notes are free-text user input. Rendering notes through
   * innerHTML allows user-provided markup to be parsed as HTML.
   *
   * This implementation uses DOM API construction and textContent-based cells
   * so that notes such as `<img src=x onerror=alert(1)>` are displayed as text
   * rather than executed.
   */
  BizTrackSafeDOM.clearElement(transactionTableBody);

  transactions.forEach((transaction) => {
    const transactionRow = document.createElement("tr");
    transactionRow.className = "transaction-row";

    transactionRow.dataset.trID = transaction.trID;
    transactionRow.dataset.trDate = transaction.trDate;
    transactionRow.dataset.trCategory = transaction.trCategory;
    transactionRow.dataset.trAmount = transaction.trAmount;
    transactionRow.dataset.trNotes = transaction.trNotes;

    BizTrackSafeDOM.appendTextCell(transactionRow, transaction.trID);
    BizTrackSafeDOM.appendTextCell(transactionRow, transaction.trDate);
    BizTrackSafeDOM.appendTextCell(transactionRow, transaction.trCategory);
    BizTrackSafeDOM.appendTextCell(
      transactionRow,
      BizTrackSafeDOM.formatCurrency(transaction.trAmount),
      "tr-amount"
    );
    BizTrackSafeDOM.appendTextCell(transactionRow, transaction.trNotes);

    /*
     * SECURITY FIX:
     * The previous action icons used dynamically generated inline onclick
     * handlers. Event listeners avoid embedding transaction IDs inside HTML
     * or JavaScript strings.
     */
    const editButton = BizTrackSafeDOM.createIconButton({
      label: `Edit expense ${BizTrackSafeDOM.toDisplayText(transaction.trID)}`,
      title: "Edit",
      iconClassName: "fa-solid fa-pen-to-square",
      className: "icon-button edit-icon",
      onClick: () => editRow(transaction.trID),
    });

    const deleteButton = BizTrackSafeDOM.createIconButton({
      label: `Delete expense ${BizTrackSafeDOM.toDisplayText(transaction.trID)}`,
      title: "Delete",
      iconClassName: "fas fa-trash-alt",
      className: "icon-button delete-icon",
      onClick: () => deleteTransaction(transaction.trID),
    });

    BizTrackSafeDOM.appendActionCell(transactionRow, [
      editButton,
      deleteButton,
    ]);

    transactionTableBody.appendChild(transactionRow);
  });

  displayExpenses();
}


function displayExpenses() {
  const resultElement = document.getElementById("total-expenses");

  /*
   * SECURITY FIX:
   * Summary output is rendered using textContent-based DOM construction for
   * consistency with the safer rendering model adopted across the CRUD pages.
   */
  const totalExpenses = transactions.reduce(
    (total, transaction) => total + Number(transaction.trAmount || 0),
    0
  );

  BizTrackSafeDOM.setSingleTextSpan(
    resultElement,
    `Total Expenses: $${totalExpenses.toFixed(2)}`
  );
}

function editRow(trID) {
    const normalizedId = normalizeTransactionId(trID);

    if (normalizedId === null) {
        console.warn("Cannot edit transaction because the transaction ID is invalid:", trID);
        return;
    }

    const trToEdit = transactions.find(transaction => normalizeTransactionId(transaction.trID) === normalizedId);

    if (!trToEdit) {
        console.warn("Cannot edit transaction because no matching record was found:", trID);
        return;
    }
    
    document.getElementById("tr-id").value = trToEdit.trID;      
    document.getElementById("tr-date").value = trToEdit.trDate;
    document.getElementById("tr-category").value = trToEdit.trCategory;
    document.getElementById("tr-amount").value = trToEdit.trAmount;
    document.getElementById("tr-notes").value = trToEdit.trNotes;
  
    document.getElementById("submitBtn").textContent = "Update";

    document.getElementById("transaction-form").style.display = "block";
  }

  document.getElementById("tr-id").value = trToEdit.trID;
  document.getElementById("tr-date").value = trToEdit.trDate;
  document.getElementById("tr-category").value = trToEdit.trCategory;
  document.getElementById("tr-amount").value = trToEdit.trAmount;
  document.getElementById("tr-notes").value = trToEdit.trNotes;

  document.getElementById("submitBtn").textContent = "Update";
  document.getElementById("transaction-form").style.display = "block";
}

function deleteTransaction(trID) {
    const normalizedId = normalizeTransactionId(trID);

    if (normalizedId === null) {
        console.warn("Cannot delete transaction because the transaction ID is invalid:", trID);
        return;
    }

    const indexToDelete = transactions.findIndex(transaction => normalizeTransactionId(transaction.trID) === normalizedId);

  const indexToDelete = transactions.findIndex(
    (transaction) => normalizeTransactionId(transaction.trID) === normalizedId
  );

        saveTransactions(transactions);
        renderTransactions(transactions);
    }
}

function updateTransaction(trID) {
    const normalizedId = normalizeTransactionId(trID);

    if (normalizedId === null) {
        console.warn("Cannot update transaction because the transaction ID is invalid:", trID);
        return;
    }

    const indexToUpdate = transactions.findIndex(transaction => normalizeTransactionId(transaction.trID) === normalizedId);

    if (indexToUpdate !== -1) {
        const updatedTransaction = {
            trID: normalizedId,
            trDate: document.getElementById("tr-date").value,
            trCategory: document.getElementById("tr-category").value,
            trAmount: parseFloat(document.getElementById("tr-amount").value),
            trNotes: document.getElementById("tr-notes").value,
        };

    transactions[indexToUpdate] = updatedTransaction;

        transactions = ensureUniqueTransactionIds(transactions);
        saveTransactions(transactions);
        renderTransactions(transactions);

    document.getElementById("transaction-form").reset();
    document.getElementById("submitBtn").textContent = "Add";
  }
}


function sortTable(column) {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    const isNumeric = column === "trID" || column === "trAmount";

    const sortedRows = rows.sort((a, b) => {
        const aValue = isNumeric ? parseFloat(a.dataset[column]) : a.dataset[column];
        const bValue = isNumeric ? parseFloat(b.dataset[column]) : b.dataset[column];

        if (typeof aValue === "string" && typeof bValue === "string") {
            // Case-insensitive string comparison for text columns
            return aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
        } else {
            return aValue - bValue;
        }
    });

    rows.forEach(row => tbody.removeChild(row));

    sortedRows.forEach(row => tbody.appendChild(row));
}

document.getElementById("searchInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        performSearch();
    }
});


function performSearch() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll(".transaction-row");

    rows.forEach(row => {
        const visible = row.innerText.toLowerCase().includes(searchInput);
        row.style.display = visible ? "table-row" : "none";
    });
}


function exportToCSV() {
  /*
   * CSV ROBUSTNESS FIX:
   * The original expense export inferred headers from data[0], so exporting
   * an empty transaction list caused a runtime error. Explicit column
   * definitions allow the application to export a valid header-only CSV.
   */
  const transactionColumns = [
    {
      header: "Transaction ID",
      value: (transaction) => transaction.trID,
    },
    {
      header: "Date",
      value: (transaction) => transaction.trDate,
    },
    {
      header: "Expense Category",
      value: (transaction) => transaction.trCategory,
    },
    {
      header: "Amount",
      value: (transaction) => Number(transaction.trAmount || 0).toFixed(2),
    },
    {
      header: "Notes",
      value: (transaction) => transaction.trNotes,
    },
  ];

  /*
   * SECURITY FIX:
   * Transaction notes are free-text user input. The shared CSV utility ensures
   * that commas, quotes, line breaks, and formula-like prefixes are handled
   * consistently before the file is downloaded.
   */
  BizTrackCSV.exportRecordsToCSV({
    filename: "biztrack_expense_table.csv",
    records: transactions,
    columns: transactionColumns,
  });
}
