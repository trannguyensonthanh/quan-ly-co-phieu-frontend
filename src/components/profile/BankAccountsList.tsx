import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { BankAccount, Bank } from "@/utils/types";

interface BankAccountsListProps {
  accounts: BankAccount[];
  banks: Bank[];
}

const BankAccountsList = ({ accounts, banks }: BankAccountsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tài khoản ngân hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => {
          const bank = banks.find((bank) => bank.id === account.bankId);
          return (
            <div
              key={account.id}
              className="border rounded-lg p-3 space-y-2 hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="font-medium">{bank?.name}</span>
                  <p className="text-xs text-muted-foreground">
                    STK: {account.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatCurrency(account.balance)}
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
