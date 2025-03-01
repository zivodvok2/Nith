import { useState, useEffect } from "react";
import { SegmentedControlSingleChoice, Skeleton } from "@deriv-com/quill-ui";
import TraderDashboard from "./components/TraderDashboard";
import CopierDashboard from "./components/CopierDashboard";

const CopyTradingTab = () => {
    const [userType, setUserType] = useState("copier");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching settings (replace with actual hook if needed)
        setTimeout(() => {
            setUserType("trader"); // Example: Change based on fetched settings
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen">
            <div className="md:max-w-6xl mx-auto md:p-6">
                {/* User Type Selection */}
                <div className="flex justify-center mt-4 md:mt-6 mb-8">
                    <SegmentedControlSingleChoice
                        onChange={(index) => setUserType(index === 0 ? "copier" : "trader")}
                        options={[{ label: "Copy" }, { label: "Trade" }]}
                        selectedItemIndex={userType === "copier" ? 0 : 1}
                        size="md"
                    />
                </div>

                {/* Dashboard Content */}
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square active rounded width="100%" height="100px" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square active rounded width="100%" height="200px" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square active rounded width="100%" height="150px" />
                        </div>
                    </div>
                ) : userType === "trader" ? (
                    <TraderDashboard />
                ) : (
                    <CopierDashboard />
                )}
            </div>
        </div>
    );
};

export default CopyTradingTab;
