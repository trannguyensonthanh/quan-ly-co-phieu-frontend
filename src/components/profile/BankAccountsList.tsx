import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyBankAccountsQuery } from "@/queries/statement.queries";
import { formatCurrency } from "@/utils/format";
import { BankAccount, Bank } from "@/utils/types";

const BankAccountsList = () => {
  const { data: accounts, isLoading: isLoadingAccounts } =
    useGetMyBankAccountsQuery();

  if (isLoadingAccounts) {
    return <div>Loading bank accounts...</div>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tài khoản ngân hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts?.map((account) => {
          return (
            <div
              key={account.MaTK}
              className="border rounded-lg p-3 space-y-2 hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="font-medium">{account?.TenNH}</span>
                  <p className="text-xs text-muted-foreground">
                    STK: {account.MaTK}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatCurrency(account.SoTien)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BankAccountsList;
