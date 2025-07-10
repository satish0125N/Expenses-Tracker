// Expense Tracker App JavaScript

class ExpenseTracker {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    this.initializeApp();
  }

  initializeApp() {
    this.bindEvents();
    this.updateDisplay();
    this.displayTransactions();
  }

  bindEvents() {
    // Form submission
    document.getElementById("expense-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addTransaction();
    });

    // Category filter
    document
      .getElementById("filter-category")
      .addEventListener("change", (e) => {
        this.filterTransactions(e.target.value);
      });

    // Clear all transactions
    document.getElementById("clear-all").addEventListener("click", () => {
      this.clearAllTransactions();
    });
  }

  addTransaction() {
    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const type = document.getElementById("type").value;

    // Validation
    if (!description || !amount || !category || !type) {
      alert("Please fill in all fields");
      return;
    }

    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    // Create transaction object
    const transaction = {
      id: Date.now(),
      description,
      amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
      category,
      type,
      date: new Date().toISOString(),
    };

    // Add to transactions array
    this.transactions.unshift(transaction);

    // Save to localStorage
    this.saveToStorage();

    // Update display
    this.updateDisplay();
    this.displayTransactions();

    // Clear form
    this.clearForm();

    // Show success message
    this.showNotification("Transaction added successfully!", "success");
  }

  deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      this.transactions = this.transactions.filter(
        (transaction) => transaction.id !== id
      );
      this.saveToStorage();
      this.updateDisplay();
      this.displayTransactions();
      this.showNotification("Transaction deleted successfully!", "success");
    }
  }

  updateDisplay() {
    const totalIncome = this.transactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = this.transactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    const balance = totalIncome - totalExpense;

    // Update DOM elements
    document.getElementById("balance").textContent =
      this.formatCurrency(balance);
    document.getElementById("income").textContent =
      this.formatCurrency(totalIncome);
    document.getElementById("expense").textContent =
      this.formatCurrency(totalExpense);

    // Update balance color based on positive/negative
    const balanceElement = document.getElementById("balance");
    if (balance >= 0) {
      balanceElement.style.color = "white";
    } else {
      balanceElement.style.color = "#ff6b6b";
    }
  }

  displayTransactions(transactionsToShow = this.transactions) {
    const transactionList = document.getElementById("transaction-list");

    if (transactionsToShow.length === 0) {
      transactionList.innerHTML =
        '<div class="no-transactions">No transactions found</div>';
      return;
    }

    transactionList.innerHTML = transactionsToShow
      .map((transaction) => {
        const amountClass = transaction.amount > 0 ? "income" : "expense";
        const amountSymbol = transaction.amount > 0 ? "+" : "";
        const formattedDate = this.formatDate(transaction.date);

        return `
                <div class="transaction-item">
                    <div class="transaction-details">
                        <div class="transaction-date">${formattedDate}</div>
                        <div class="transaction-description">${
                          transaction.description
                        }</div>
                        <span class="transaction-category">${
                          transaction.category
                        }</span>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountSymbol}${this.formatCurrency(
          Math.abs(transaction.amount)
        )}
                    </div>
                    <button class="delete-btn" onclick="expenseTracker.deleteTransaction(${
                      transaction.id
                    })">
                        Delete
                    </button>
                </div>
            `;
      })
      .join("");
  }

  filterTransactions(category) {
    if (category === "") {
      this.displayTransactions();
    } else {
      const filteredTransactions = this.transactions.filter(
        (transaction) => transaction.category === category
      );
      this.displayTransactions(filteredTransactions);
    }
  }

  clearAllTransactions() {
    if (
      confirm(
        "Are you sure you want to clear all transactions? This action cannot be undone."
      )
    ) {
      this.transactions = [];
      this.saveToStorage();
      this.updateDisplay();
      this.displayTransactions();
      document.getElementById("filter-category").value = "";
      this.showNotification("All transactions cleared!", "success");
    }
  }

  clearForm() {
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("type").value = "";
  }

  saveToStorage() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#4CAF50" : "#f44336"};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

    // Add CSS animation
    if (!document.getElementById("notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
      document.head.appendChild(styles);
    }

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Export transactions to CSV
  exportToCSV() {
    if (this.transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const csvHeaders = "Date,Description,Category,Type,Amount\n";
    const csvData = this.transactions
      .map((transaction) => {
        const date = new Date(transaction.date).toLocaleDateString();
        const amount = Math.abs(transaction.amount);
        return `${date},"${transaction.description}","${transaction.category}","${transaction.type}",${amount}`;
      })
      .join("\n");

    const csvContent = csvHeaders + csvData;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-tracker-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  // Get spending statistics
  getSpendingStats() {
    const stats = {
      totalTransactions: this.transactions.length,
      totalIncome: 0,
      totalExpenses: 0,
      categoriesBreakdown: {},
      monthlySpending: {},
    };

    this.transactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        stats.totalIncome += transaction.amount;
      } else {
        stats.totalExpenses += Math.abs(transaction.amount);
      }

      // Category breakdown
      if (!stats.categoriesBreakdown[transaction.category]) {
        stats.categoriesBreakdown[transaction.category] = 0;
      }
      stats.categoriesBreakdown[transaction.category] += Math.abs(
        transaction.amount
      );

      // Monthly breakdown
      const month = new Date(transaction.date).toISOString().slice(0, 7);
      if (!stats.monthlySpending[month]) {
        stats.monthlySpending[month] = 0;
      }
      if (transaction.amount < 0) {
        stats.monthlySpending[month] += Math.abs(transaction.amount);
      }
    });

    return stats;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.expenseTracker = new ExpenseTracker();
});

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to submit form
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    const form = document.getElementById("expense-form");
    if (form) {
      form.dispatchEvent(new Event("submit"));
    }
  }

  // Escape to clear form
  if (e.key === "Escape") {
    if (window.expenseTracker) {
      window.expenseTracker.clearForm();
    }
  }
});

// Add export functionality (optional feature)
function addExportButton() {
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export CSV";
  exportBtn.className = "btn-secondary";
  exportBtn.style.marginLeft = "10px";
  exportBtn.onclick = () => window.expenseTracker.exportToCSV();

  document.querySelector(".filter-section").appendChild(exportBtn);
}

// Add stats display (optional feature)
function showStats() {
  const stats = window.expenseTracker.getSpendingStats();

  let statsHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h4>Spending Statistics</h4>
            <p><strong>Total Transactions:</strong> ${
              stats.totalTransactions
            }</p>
            <p><strong>Total Income:</strong> ${window.expenseTracker.formatCurrency(
              stats.totalIncome
            )}</p>
            <p><strong>Total Expenses:</strong> ${window.expenseTracker.formatCurrency(
              stats.totalExpenses
            )}</p>
            <p><strong>Net Balance:</strong> ${window.expenseTracker.formatCurrency(
              stats.totalIncome - stats.totalExpenses
            )}</p>
            <h5>Top Categories:</h5>
            <ul>
    `;

  const sortedCategories = Object.entries(stats.categoriesBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  sortedCategories.forEach(([category, amount]) => {
    statsHTML += `<li>${category}: ${window.expenseTracker.formatCurrency(
      amount
    )}</li>`;
  });

  statsHTML += "</ul></div>";

  const existingStats = document.querySelector(".stats-display");
  if (existingStats) {
    existingStats.remove();
  }

  const statsDiv = document.createElement("div");
  statsDiv.className = "stats-display";
  statsDiv.innerHTML = statsHTML;

  document.querySelector(".container").appendChild(statsDiv);
}

// Auto-save functionality
setInterval(() => {
  if (window.expenseTracker) {
    window.expenseTracker.saveToStorage();
  }
}, 30000); // Save every 30 seconds
