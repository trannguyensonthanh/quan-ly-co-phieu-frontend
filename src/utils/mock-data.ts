import { Bank, BankAccount, MoneyTransaction, Order, Stock, StockOwnership, Transaction, User } from './types';

export const mockUsers: User[] = [
  {
    id: 'NDT001',
    username: 'investor1',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    birthDate: '1985-05-15',
    address: 'Số 123 Đường Lê Lợi, Quận 1, TP.HCM',
    phone: '0901234567',
    idNumber: '123456789',
    gender: 'Nam',
    role: 'investor'
  },
  {
    id: 'NDT002',
    username: 'investor2',
    fullName: 'Trần Thị B',
    email: 'tranthib@example.com',
    birthDate: '1990-10-20',
    address: 'Số 45 Đường Nguyễn Huệ, Quận Hoàn Kiếm, Hà Nội',
    phone: '0912345678',
    idNumber: '987654321',
    gender: 'Nữ',
    role: 'investor'
  },
  {
    id: 'NV001',
    username: 'employee1',
    fullName: 'Lê Văn C',
    email: 'levanc@example.com',
    birthDate: '1988-03-12',
    address: 'Số 78 Đường Nguyễn Du, Quận Hai Bà Trưng, Hà Nội',
    phone: '0987654321',
    idNumber: '111222333',
    gender: 'Nam',
    role: 'employee'
  },
  {
    id: 'NV002',
    username: 'employee2',
    fullName: 'Phạm Thị D',
    email: 'phamthid@example.com',
    birthDate: '1992-07-25',
    address: 'Số 56 Đường Lý Thường Kiệt, Quận 10, TP.HCM',
    phone: '0923456789',
    idNumber: '444555666',
    gender: 'Nữ',
    role: 'employee'
  }
];

export const mockBanks: Bank[] = [
  {
    id: 'NH001',
    name: 'VietcomBank',
    address: 'Số 198 Trần Quang Khải, Hoàn Kiếm, Hà Nội',
    phone: '1900555577',
    email: 'vcb@vietcombank.com.vn'
  },
  {
    id: 'NH002',
    name: 'Techcombank',
    address: 'Số 191 Bà Triệu, Hai Bà Trưng, Hà Nội',
    phone: '1800588822',
    email: 'info@techcombank.com.vn'
  }
];

export const mockBankAccounts: BankAccount[] = [
  {
    id: 'TK001',
    userId: 'NDT001',
    balance: 100000000,
    bankId: 'NH001'
  },
  {
    id: 'TK002',
    userId: 'NDT002',
    balance: 150000000,
    bankId: 'NH002'
  }
];

export const mockStocks: Stock[] = [
  {
    code: 'VNM',
    companyName: 'Công ty CP Sữa Việt Nam',
    address: 'Số 10 Tân Trào, Tân Phú, Quận 7, TP.HCM',
    totalShares: 1741410737,
    currentPrice: 76000,
    previousClose: 75500,
    openPrice: 75800,
    highPrice: 76500,
    lowPrice: 75300,
    volume: 1254000,
    ceilingPrice: 79000,
    floorPrice: 72000,
    referencePrice: 75500
  },
  {
    code: 'VCB',
    companyName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    address: 'Số 198 Trần Quang Khải, Hoàn Kiếm, Hà Nội',
    totalShares: 3708877448,
    currentPrice: 89200,
    previousClose: 90000,
    openPrice: 89500,
    highPrice: 90100,
    lowPrice: 89000,
    volume: 982000,
    ceilingPrice: 94500,
    floorPrice: 85500,
    referencePrice: 90000
  },
  {
    code: 'FPT',
    companyName: 'Công ty CP FPT',
    address: 'Số 17 Duy Tân, Cầu Giấy, Hà Nội',
    totalShares: 1199982911,
    currentPrice: 109500,
    previousClose: 108000,
    openPrice: 108500,
    highPrice: 110000,
    lowPrice: 108200,
    volume: 754000,
    ceilingPrice: 113400,
    floorPrice: 102600,
    referencePrice: 108000
  },
  {
    code: 'MWG',
    companyName: 'Công ty CP Đầu tư Thế Giới Di Động',
    address: 'Số 222 Yersin, Phường Phú Cường, TP. Thủ Dầu Một, Bình Dương',
    totalShares: 1469376499,
    currentPrice: 51800,
    previousClose: 53000,
    openPrice: 52500,
    highPrice: 53000,
    lowPrice: 51500,
    volume: 897000,
    ceilingPrice: 55650,
    floorPrice: 50350,
    referencePrice: 53000
  },
  {
    code: 'HPG',
    companyName: 'Công ty CP Tập đoàn Hòa Phát',
    address: 'Số 66 Nguyễn Du, Hai Bà Trưng, Hà Nội',
    totalShares: 5814786749,
    currentPrice: 27300,
    previousClose: 26800,
    openPrice: 27000,
    highPrice: 27500,
    lowPrice: 26900,
    volume: 1567000,
    ceilingPrice: 28150,
    floorPrice: 25450,
    referencePrice: 26800
  },
  {
    code: 'VRE',
    companyName: 'Công ty CP Vincom Retail',
    address: 'Số 7 Đường Bằng Lăng 1, Khu Đô thị Vinhomes Riverside, Long Biên, Hà Nội',
    totalShares: 2328818450,
    currentPrice: 26500,
    previousClose: 26700,
    openPrice: 26600,
    highPrice: 26900,
    lowPrice: 26400,
    volume: 784000,
    ceilingPrice: 28050,
    floorPrice: 25350,
    referencePrice: 26700
  }
];

export const mockOrders: Order[] = [
  {
    id: 1,
    date: '2025-04-05T09:30:00',
    type: 'M',
    method: 'LO',
    quantity: 1000,
    stockCode: 'VNM',
    price: 76000,
    accountId: 'TK001',
    status: 'Hết'
  },
  {
    id: 2,
    date: '2025-04-05T10:15:00',
    type: 'B',
    method: 'LO',
    quantity: 500,
    stockCode: 'FPT',
    price: 109000,
    accountId: 'TK002',
    status: 'Một phần'
  },
  {
    id: 3,
    date: '2025-04-04T14:30:00',
    type: 'M',
    method: 'LO',
    quantity: 2000,
    stockCode: 'VCB',
    price: 89000,
    accountId: 'TK001',
    status: 'Hết'
  },
  {
    id: 4,
    date: '2025-04-04T11:45:00',
    type: 'B',
    method: 'ATC',
    quantity: 1500,
    stockCode: 'HPG',
    price: 27000,
    accountId: 'TK001',
    status: 'Chưa'
  },
  {
    id: 5,
    date: '2025-04-03T10:00:00',
    type: 'M',
    method: 'ATO',
    quantity: 3000,
    stockCode: 'MWG',
    price: 52000,
    accountId: 'TK002',
    status: 'Một phần'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    orderId: 1,
    date: '2025-04-05T09:35:00',
    quantity: 1000,
    price: 76000,
    matchType: 'Khớp hết'
  },
  {
    id: 2,
    orderId: 2,
    date: '2025-04-05T10:20:00',
    quantity: 300,
    price: 109000,
    matchType: 'Khớp 1 phần'
  },
  {
    id: 3,
    orderId: 3,
    date: '2025-04-04T14:35:00',
    quantity: 2000,
    price: 89000,
    matchType: 'Khớp hết'
  },
  {
    id: 4,
    orderId: 5,
    date: '2025-04-03T10:05:00',
    quantity: 1500,
    price: 52000,
    matchType: 'Khớp 1 phần'
  }
];

export const mockStockOwnerships: StockOwnership[] = [
  {
    userId: 'NDT001',
    stockCode: 'VNM',
    quantity: 2000
  },
  {
    userId: 'NDT001',
    stockCode: 'FPT',
    quantity: 1000
  },
  {
    userId: 'NDT002',
    stockCode: 'VCB',
    quantity: 1500
  },
  {
    userId: 'NDT002',
    stockCode: 'HPG',
    quantity: 5000
  }
];

export const mockMoneyTransactions: MoneyTransaction[] = [
  {
    id: 1,
    userId: 'NDT001',
    date: '2025-04-05',
    openingBalance: 100000000,
    amount: -76000000,
    reason: 'Mua 1000 cổ phiếu VNM',
    closingBalance: 24000000
  },
  {
    id: 2,
    userId: 'NDT002',
    date: '2025-04-05',
    openingBalance: 150000000,
    amount: 32700000,
    reason: 'Bán 300 cổ phiếu FPT',
    closingBalance: 182700000
  },
  {
    id: 3,
    userId: 'NDT001',
    date: '2025-04-04',
    openingBalance: 278000000,
    amount: -178000000,
    reason: 'Mua 2000 cổ phiếu VCB',
    closingBalance: 100000000
  },
  {
    id: 4,
    userId: 'NDT002',
    date: '2025-04-03',
    openingBalance: 228000000,
    amount: -78000000,
    reason: 'Mua 1500 cổ phiếu MWG',
    closingBalance: 150000000
  }
];

export const authenticateUser = (username: string, password: string) => {
  const passwords = {
    'investor1': 'investor123',
    'investor2': 'investor123',
    'employee1': 'employee123',
    'employee2': 'employee123'
  };
  
  if (Object.keys(passwords).includes(username) && passwords[username as keyof typeof passwords] === password) {
    return mockUsers.find(user => user.username === username);
  }
  return null;
};

export const getUserPortfolio = (userId: string) => {
  return mockStockOwnerships.filter(ownership => ownership.userId === userId)
    .map(ownership => {
      const stock = mockStocks.find(s => s.code === ownership.stockCode);
      return {
        ...ownership,
        stockName: stock?.companyName || '',
        currentPrice: stock?.currentPrice || 0,
        totalValue: ownership.quantity * (stock?.currentPrice || 0)
      };
    });
};

export const getUserOrders = (userId: string) => {
  const userAccount = mockBankAccounts.find(account => account.userId === userId);
  if (!userAccount) return [];
  
  return mockOrders.filter(order => order.accountId === userAccount.id);
};

export const getUserMoneyTransactions = (userId: string, startDate?: string, endDate?: string) => {
  let transactions = mockMoneyTransactions.filter(transaction => transaction.userId === userId);
  
  if (startDate) {
    transactions = transactions.filter(transaction => new Date(transaction.date) >= new Date(startDate));
  }
  
  if (endDate) {
    transactions = transactions.filter(transaction => new Date(transaction.date) <= new Date(endDate));
  }
  
  return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getAccountBalance = (userId: string) => {
  const account = mockBankAccounts.find(account => account.userId === userId);
  return account ? account.balance : 0;
};

export const getStockOrders = (stockCode: string, startDate?: string, endDate?: string) => {
  let orders = mockOrders.filter(order => order.stockCode === stockCode);
  
  if (startDate) {
    orders = orders.filter(order => new Date(order.date) >= new Date(startDate));
  }
  
  if (endDate) {
    orders = orders.filter(order => new Date(order.date) <= new Date(endDate));
  }
  
  return orders.map(order => {
    const transactions = mockTransactions.filter(t => t.orderId === order.id);
    const totalMatchedQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
    
    return {
      ...order,
      transactions: transactions,
      matchedQuantity: totalMatchedQuantity
    };
  });
};

export const createUser = (userData: Omit<User, 'id'>) => {
  const newUser = {
    ...userData,
    id: `${userData.role === 'investor' ? 'NDT' : 'NV'}${String(mockUsers.length + 1).padStart(3, '0')}`
  };
  
  mockUsers.push(newUser as User);
  return newUser;
};

export const deleteUser = (userId: string) => {
  const index = mockUsers.findIndex(user => user.id === userId);
  if (index !== -1) {
    mockUsers.splice(index, 1);
    return true;
  }
  return false;
};
