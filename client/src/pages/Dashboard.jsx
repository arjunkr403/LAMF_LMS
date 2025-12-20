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

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await api.get("/applications");
        setApplications(data);
      } catch (error) {
        console.error("Failed to fetch applications");
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.profile?.firstName}
            </h1>
            <p className="text-gray-600">Manage your loan applications</p>
          </div>
          <div className="space-x-4">
            <Link to="/new-application">
              <Button>New Application</Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">
                No active loan applications found.
              </p>
              <Link to="/new-application" className="mt-4 inline-block">
                <Button variant="secondary">Start New Application</Button>
              </Link>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">
                    {app.applicationId}
                  </CardTitle>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(app.status)}`}
                  >
                    {app.status}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-gray-500">Product</p>
                      <p className="font-semibold">
                        {app.product?.name || "Standard Loan"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Requested</p>
                      <p className="font-semibold">
                        ₹{app.requestedLoanAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Collateral Value</p>
                      <p className="font-semibold">
                        ₹{app.totalCollateralValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">LTV</p>
                      <p className="font-semibold">
                        {app.calculatedLTV.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
