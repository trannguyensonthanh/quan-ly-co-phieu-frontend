import {
  Bank,
  BankAccount,
  MoneyTransaction,
  Order,
  Stock,
  StockOwnership,
  Transaction,
  User,
} from "./types";

export const mockUsers: User[] = [
  {
    username: "NDT001",
    HoTen: "Nguyễn Văn A",
    password: "investor123",
    Email: "nguyenvana@example.com",
    NgaySinh: "1985-05-15",
    DiaChi: "Số 123 Đường Lê Lợi, Quận 1, TP.HCM",
    Phone: "0901234567",
    CMND: "123456789",
    GioiTinh: "Nam",
    role: "NhaDauTu",
  },
  {
    username: "NDT002",
    HoTen: "Trần Thị B",
    password: "investor123",
    Email: "tranthib@example.com",
    NgaySinh: "1990-10-20",
    DiaChi: "Số 45 Đường Nguyễn Huệ, Quận Hoàn Kiếm, Hà Nội",
    Phone: "0912345678",
    CMND: "987654321",
    GioiTinh: "Nữ",
    role: "NhaDauTu",
  },
  {
    username: "NV001",
    HoTen: "Lê Văn C",
    password: "employee123",
    Email: "levanc@example.com",
    NgaySinh: "1988-03-12",
    DiaChi: "Số 78 Đường Nguyễn Du, Quận Hai Bà Trưng, Hà Nội",
    Phone: "0987654321",
    CMND: "111222333",
    GioiTinh: "Nam",
    role: "NhanVien",
  },
  {
    username: "NV002",
    HoTen: "Phạm Thị D",
    password: "employee123",
    Email: "phamthid@example.com",
    NgaySinh: "1992-07-25",
    DiaChi: "Số 56 Đường Lý Thường Kiệt, Quận 10, TP.HCM",
    Phone: "0923456789",
    CMND: "444555666",
    GioiTinh: "Nữ",
    role: "NhanVien",
  },
];

export const mockBanks: Bank[] = [
  {
    id: "NH001",
    name: "VietcomBank",
    address: "Số 198 Trần Quang Khải, Hoàn Kiếm, Hà Nội",
    phone: "1900555577",
    email: "vcb@vietcombank.com.vn",
  },
  {
    id: "NH002",
    name: "Techcombank",
    address: "Số 191 Bà Triệu, Hai Bà Trưng, Hà Nội",
    phone: "1800588822",
    email: "info@techcombank.com.vn",
  },
  {
    id: "NH003",
    name: "BIDV",
    address: "Số 35 Hàng Vôi, Hoàn Kiếm, Hà Nội",
    phone: "1900969696",
    email: "info@bidv.com.vn",
  },
  {
    id: "NH004",
    name: "VPBank",
    address: "Số 89 Láng Hạ, Đống Đa, Hà Nội",
    phone: "1900545415",
    email: "contact@vpbank.com.vn",
  },
];

export const mockBankAccounts: BankAccount[] = [
  {
    id: "TK001",
    userId: "NDT001",
    balance: 100000000,
    bankId: "NH001",
  },
  {
    id: "TK002",
    userId: "NDT002",
    balance: 150000000,
    bankId: "NH002",
  },
  {
    id: "TK003",
    userId: "NDT001",
    balance: 50000000,
    bankId: "NH003",
  },
];

export const mockStocks: Stock[] = [
  {
    MaCP: "ABC",
    TenCty: "Công ty CP ABC Group",
    DiaChi: "Số 123 Đường XYZ, Quận 1, TP.HCM",
    SoLuongPH: 1000000,
    GiaKhopCuoi: 0,
    previousClose: 0,
    openPrice: 0,
    highPrice: 0,
    lowPrice: 0,
    GiaSan: 0,
    GiaTC: 0,
    GiaTran: 0,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 0,
    Status: 0, // Unlisted
  },
  {
    MaCP: "XYZ",
    TenCty: "Công ty CP XYZ Solutions",
    DiaChi: "Số 456 Đường ABC, Quận 2, TP.HCM",
    SoLuongPH: 2000000,
    GiaKhopCuoi: 0,
    previousClose: 0,
    openPrice: 0,
    highPrice: 0,
    lowPrice: 0,
    GiaSan: 0,
    GiaTC: 0,
    GiaTran: 0,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 0,
    Status: 0, // Unlisted
  },
  {
    MaCP: "DEF",
    TenCty: "Công ty CP Đầu tư DEF",
    DiaChi: "Số 789 Đường DEF, Quận 3, TP.HCM",
    SoLuongPH: 1500000,
    GiaKhopCuoi: 0,
    previousClose: 0,
    openPrice: 0,
    highPrice: 0,
    lowPrice: 0,
    GiaSan: 0,
    GiaTC: 0,
    GiaTran: 0,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 0,
    Status: 0, // Unlisted
  },
  {
    MaCP: "VNM",
    TenCty: "Công ty CP Sữa Việt Nam",
    DiaChi: "Số 10 Tân Trào, Tân Phú, Quận 7, TP.HCM",
    SoLuongPH: 1741410737,
    GiaKhopCuoi: 76000,
    previousClose: 75500,
    openPrice: 75800,
    highPrice: 76500,
    lowPrice: 75300,
    GiaSan: 72000,
    GiaTC: 75500,
    GiaTran: 79000,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 1254000,
    Status: 1,
  },
  {
    MaCP: "VCB",
    TenCty: "Ngân hàng TMCP Ngoại thương Việt Nam",
    DiaChi: "Số 198 Trần Quang Khải, Hoàn Kiếm, Hà Nội",
    SoLuongPH: 3708877448,
    GiaKhopCuoi: 89200,
    previousClose: 90000,
    openPrice: 89500,
    highPrice: 90100,
    lowPrice: 89000,
    GiaSan: 85500,
    GiaTC: 90000,
    GiaTran: 94500,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 982000,
    Status: 1,
  },
  {
    MaCP: "FPT",
    TenCty: "Công ty CP FPT",
    DiaChi: "Số 17 Duy Tân, Cầu Giấy, Hà Nội",
    SoLuongPH: 1199982911,
    GiaKhopCuoi: 109500,
    previousClose: 108000,
    openPrice: 108500,
    highPrice: 110000,
    lowPrice: 108200,
    GiaSan: 102600,
    GiaTC: 108000,
    GiaTran: 113400,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 754000,
    Status: 1,
  },
  {
    MaCP: "MWG",
    TenCty: "Công ty CP Đầu tư Thế Giới Di Động",
    DiaChi: "Số 222 Yersin, Phường Phú Cường, TP. Thủ Dầu Một, Bình Dương",
    SoLuongPH: 1469376499,
    GiaKhopCuoi: 51800,
    previousClose: 53000,
    openPrice: 52500,
    highPrice: 53000,
    lowPrice: 51500,
    GiaSan: 50350,
    GiaTC: 53000,
    GiaTran: 55650,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 897000,
    Status: 1,
  },
  {
    MaCP: "HPG",
    TenCty: "Công ty CP Tập đoàn Hòa Phát",
    DiaChi: "Số 66 Nguyễn Du, Hai Bà Trưng, Hà Nội",
    SoLuongPH: 5814786749,
    GiaKhopCuoi: 27300,
    previousClose: 26800,
    openPrice: 27000,
    highPrice: 27500,
    lowPrice: 26900,
    GiaSan: 25450,
    GiaTC: 26800,
    GiaTran: 28150,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 1567000,
    Status: 1,
  },
  {
    MaCP: "VRE",
    TenCty: "Công ty CP Vincom Retail",
    DiaChi:
      "Số 7 Đường Bằng Lăng 1, Khu Đô thị Vinhomes Riverside, Long Biên, Hà Nội",
    SoLuongPH: 2328818450,
    GiaKhopCuoi: 26500,
    previousClose: 26700,
    openPrice: 26600,
    highPrice: 26900,
    lowPrice: 26400,
    GiaSan: 25350,
    GiaTC: 26700,
    GiaTran: 28050,
    GiaBan1: 0,
    GiaBan2: 0,
    GiaBan3: 0,
    GiaMua1: 0,
    GiaMua2: 0,
    GiaMua3: 0,
    KLBan1: 0,
    KLBan2: 0,
    KLBan3: 0,
    KLMua1: 0,
    KLMua2: 0,
    KLMua3: 0,
    KLKhopCuoi: 0,
    PhanTramThayDoi: 0,
    ThayDoi: 0,
    TongKLDatBan: 0,
    TongKLDatMua: 0,
    TongKLKhop: 784000,
    Status: 1,
  },
];

export const mockOrders: Order[] = [
  {
    id: 1,
    date: "2025-04-05T09:30:00",
    type: "M",
    method: "LO",
    quantity: 1000,
    stockCode: "VNM",
    price: 76000,
    accountId: "TK001",
    status: "Hết",
  },
  {
    id: 2,
    date: "2025-04-05T10:15:00",
    type: "B",
    method: "LO",
    quantity: 500,
    stockCode: "FPT",
    price: 109000,
    accountId: "TK002",
    status: "Một phần",
  },
  {
    id: 3,
    date: "2025-04-04T14:30:00",
    type: "M",
    method: "LO",
    quantity: 2000,
    stockCode: "VCB",
    price: 89000,
    accountId: "TK001",
    status: "Hết",
  },
  {
    id: 4,
    date: "2025-04-04T11:45:00",
    type: "B",
    method: "ATC",
    quantity: 1500,
    stockCode: "HPG",
    price: 27000,
    accountId: "TK001",
    status: "Chưa",
  },
  {
    id: 5,
    date: "2025-04-03T10:00:00",
    type: "M",
    method: "ATO",
    quantity: 3000,
    stockCode: "MWG",
    price: 52000,
    accountId: "TK002",
    status: "Một phần",
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    orderId: 1,
    date: "2025-04-05T09:35:00",
    quantity: 1000,
    price: 76000,
    matchType: "Khớp hết",
  },
  {
    id: 2,
    orderId: 2,
    date: "2025-04-05T10:20:00",
    quantity: 300,
    price: 109000,
    matchType: "Khớp 1 phần",
  },
  {
    id: 3,
    orderId: 3,
    date: "2025-04-04T14:35:00",
    quantity: 2000,
    price: 89000,
    matchType: "Khớp hết",
  },
  {
    id: 4,
    orderId: 5,
    date: "2025-04-03T10:05:00",
    quantity: 1500,
    price: 52000,
    matchType: "Khớp 1 phần",
  },
];

export const mockStockOwnerships: StockOwnership[] = [
  {
    userId: "NDT001",
    stockCode: "VNM",
    quantity: 2000,
  },
  {
    userId: "NDT001",
    stockCode: "FPT",
    quantity: 1000,
  },
  {
    userId: "NDT002",
    stockCode: "VCB",
    quantity: 1500,
  },
  {
    userId: "NDT002",
    stockCode: "HPG",
    quantity: 5000,
  },
];

export const mockMoneyTransactions: MoneyTransaction[] = [
  {
    id: 1,
    userId: "NDT001",
    date: "2025-04-05",
    openingBalance: 100000000,
    amount: -76000000,
    reason: "Mua 1000 cổ phiếu VNM",
    closingBalance: 24000000,
  },
  {
    id: 2,
    userId: "NDT002",
    date: "2025-04-05",
    openingBalance: 150000000,
    amount: 32700000,
    reason: "Bán 300 cổ phiếu FPT",
    closingBalance: 182700000,
  },
  {
    id: 3,
    userId: "NDT001",
    date: "2025-04-04",
    openingBalance: 278000000,
    amount: -178000000,
    reason: "Mua 2000 cổ phiếu VCB",
    closingBalance: 100000000,
  },
  {
    id: 4,
    userId: "NDT002",
    date: "2025-04-03",
    openingBalance: 228000000,
    amount: -78000000,
    reason: "Mua 1500 cổ phiếu MWG",
    closingBalance: 150000000,
  },
];

export const authenticateUser = (username: string, password: string) => {
  const passwords = {
    investor1: "investor123",
    investor2: "investor123",
    employee1: "employee123",
    employee2: "employee123",
  };

  if (
    Object.keys(passwords).includes(username) &&
    passwords[username as keyof typeof passwords] === password
  ) {
    return mockUsers.find((user) => user.username === username);
  }
  return null;
};

export const getUserPortfolio = (userId: string) => {
  return mockStockOwnerships
    .filter((ownership) => ownership.userId === userId)
    .map((ownership) => {
      const stock = mockStocks.find((s) => s.MaCP === ownership.stockCode);
      return {
        ...ownership,
        stockName: stock?.TenCty || "",
        currentPrice: stock?.GiaKhopCuoi || 0,
        totalValue: ownership.quantity * (stock?.GiaKhopCuoi || 0),
      };
    });
};

export const getUserOrders = (userId: string) => {
  const userAccount = mockBankAccounts.find(
    (account) => account.userId === userId
  );
  if (!userAccount) return [];

  return mockOrders.filter((order) => order.accountId === userAccount.id);
};

export const getUserMoneyTransactions = (
  userId: string,
  startDate?: string,
  endDate?: string
) => {
  let transactions = mockMoneyTransactions.filter(
    (transaction) => transaction.userId === userId
  );

  if (startDate) {
    transactions = transactions.filter(
      (transaction) => new Date(transaction.date) >= new Date(startDate)
    );
  }

  if (endDate) {
    transactions = transactions.filter(
      (transaction) => new Date(transaction.date) <= new Date(endDate)
    );
  }

  return transactions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const getAccountBalance = (userId: string) => {
  const account = mockBankAccounts.find((account) => account.userId === userId);
  return account ? account.balance : 0;
};

export const getStockOrders = (
  stockCode: string,
  startDate?: string,
  endDate?: string
) => {
  let orders = mockOrders.filter((order) => order.stockCode === stockCode);

  if (startDate) {
    orders = orders.filter(
      (order) => new Date(order.date) >= new Date(startDate)
    );
  }

  if (endDate) {
    orders = orders.filter(
      (order) => new Date(order.date) <= new Date(endDate)
    );
  }

  return orders.map((order) => {
    const transactions = mockTransactions.filter((t) => t.orderId === order.id);
    const totalMatchedQuantity = transactions.reduce(
      (sum, t) => sum + t.quantity,
      0
    );

    return {
      ...order,
      transactions: transactions,
      matchedQuantity: totalMatchedQuantity,
    };
  });
};

export const createUser = (userData: Omit<User, "id">) => {
  const newUser = {
    ...userData,
    id: `${userData.role === "NhanVien" ? "NDT" : "NV"}${String(
      mockUsers.length + 1
    ).padStart(3, "0")}`,
  };

  mockUsers.push(newUser as User);
  return newUser;
};

export const deleteUser = (userId: string) => {
  const index = mockUsers.findIndex((user) => user.username === userId);
  if (index !== -1) {
    mockUsers.splice(index, 1);
    return true;
  }
  return false;
};
