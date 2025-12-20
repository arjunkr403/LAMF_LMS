import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'APPROVED', 'REJECTED', 'DISBURSED'

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/applications/${id}`);
        setApplication(data);
      } catch (error) {
        console.error("Failed to load application");
        toast.error("Failed to load application details");
      }
    };
    fetchDetails();
  }, [id]);

  const handleActionClick = (type) => {
    setActionType(type);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    setLoading(true);
    try {
      await api.put(`/applications/${id}/status`, { status: actionType });
      setApplication((prev) => ({ ...prev, status: actionType }));
      toast.success(`Application marked as ${actionType}`);
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!application) return <div className="p-8">Loading details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            &larr; Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Review: {application.applicationId}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left Column: Applicant & Loan Info */}
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicant Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <p className="font-medium">
                    {application.applicant?.profile?.firstName}{" "}
                    {application.applicant?.profile?.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{application.applicant?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p className="font-medium">
                    {application.applicant?.profile?.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">PAN Card</Label>
                  <p className="font-medium">
                    {application.applicant?.profile?.panCard}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-gray-500">Product</Label>
                  <p className="font-medium">{application.product?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Requested Amount</Label>
                  <p className="font-medium text-lg">
                    ₹{application.requestedLoanAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Eligible Amount</Label>
                  <p className="font-medium text-green-600">
                    ₹{application.eligibleLoanAmount.toLocaleString()}
                  </p>
                </div>
                <div className="pt-2">
                  <Label className="text-gray-500">Calculated LTV</Label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl font-bold ${application.calculatedLTV > application.product?.maxLTV ? "text-red-600" : "text-blue-600"}`}
                    >
                      {application.calculatedLTV.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">
                      (Max: {application.product?.maxLTV}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Collateral & Actions */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pledged Collateral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Scheme
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Units
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">
                          NAV
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {application.collateral?.map((col) => (
                        <tr key={col._id}>
                          <td className="px-4 py-2">
                            <div className="font-medium">{col.schemeName}</div>
                            <div className="text-xs text-gray-500">
                              {col.isin}
                            </div>
                          </td>
                          <td className="px-4 py-2">{col.unitsPledged}</td>
                          <td className="px-4 py-2 text-right">
                            ₹{col.unitNav}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold">
                            ₹{col.totalValue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan="3" className="px-4 py-2 text-right">
                          Total Portfolio Value
                        </td>
                        <td className="px-4 py-2 text-right">
                          ₹{application.totalCollateralValue.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decision Console</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 rounded-lg border bg-gray-50 p-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="text-xl font-bold">{application.status}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 border-t bg-gray-50/50 p-6">
                {application.status !== "APPROVED" &&
                  application.status !== "DISBURSED" &&
                  application.status !== "REJECTED" && (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleActionClick("APPROVED")}
                        disabled={loading}
                      >
                        Approve Loan
                      </Button>
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => handleActionClick("REJECTED")}
                        disabled={loading}
                      >
                        Reject Application
                      </Button>
                    </>
                  )}

                {application.status === "APPROVED" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleActionClick("DISBURSED")}
                    disabled={loading}
                  >
                    Disburse Funds
                  </Button>
                )}

                {(application.status === "REJECTED" ||
                  application.status === "DISBURSED") && (
                  <p className="w-full text-center text-sm text-gray-500">
                    This application is closed. No further actions available.
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark this application as{" "}
                <strong>{actionType}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={loading}
                className={
                  actionType === "REJECTED"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminApplicationDetails;
