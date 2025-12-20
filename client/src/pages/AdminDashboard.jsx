import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../lib/axios";
import { Button } from "../components/ui/button";
import { getStatusColor } from "../lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchAllApps = async () => {
      try {
        const { data } = await api.get("/applications/admin/all");
        setApplications(data);
      } catch (error) {
        console.error("Failed to fetch applications");
      }
    };
    fetchAllApps();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-600">Overview of all loan requests</p>
          </div>
          <div className="flex gap-4">
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Loan Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      App ID
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Applicant
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      LTV
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {applications.map((app) => (
                    <tr
                      key={app._id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">
                        {app.applicationId}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span>
                            {app.applicant?.profile?.firstName}{" "}
                            {app.applicant?.profile?.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {app.applicant?.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{app.product?.name}</td>
                      <td className="p-4 align-middle">
                        ₹{app.requestedLoanAmount.toLocaleString()}
                      </td>
                      <td className="p-4 align-middle">
                        {app.calculatedLTV.toFixed(2)}%
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${getStatusColor(app.status)}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle">
                        <Link to={`/admin/applications/${app._id}`}>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
