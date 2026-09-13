import { startTransition, useEffect, useState } from "react";
import styles from "./Checkout.module.css";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import {
  MAX_ADDRESS_LENGTH,
  MIN_ADDRESS_LENGTH,
  createOrder,
  fetchCheckoutInfo,
} from "../api/checkoutApi";
import { useQuery } from "@tanstack/react-query";
import LoginPrompt from "../components/LoginPrompt";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import InlineDropdown from "../components/InlineDropdown";
import { getErrorMessage } from "../lib/getErrorMessage";

export default function Checkout() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressOption, setAddressOption] = useState("myAddress");
  const [newAddress, setNewAddress] = useState("");

  const [showCancelBox, setShowCancelBox] = useState(false);
  const [paymentCanceled, setPaymentCanceled] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });

  const [orderError, setOrderError] = useState("");

  const {
    data: checkoutInfo,
    isLoading,
    isError,
    error: checkoutInfoError,
  } = useQuery({
    queryKey: ["checkoutInfo"],
    queryFn: fetchCheckoutInfo,
  });

  useEffect(() => {
    if (checkoutInfo) {
      startTransition(() => {
        setFullName(checkoutInfo.fullName || "");
        setPhoneNumber(checkoutInfo.phone_number || "");
      });
    }
  }, [checkoutInfo]);

  if (!user) {
    return (
      <div className={styles.checkoutPage}>
        <LoginPrompt
          title="Log in to continue with your order"
          message="Please log in first to continue with your order."
        />
      </div>
    );
  }

  if (isLoading) return <LoadingState label="Preparing checkout" />;
  if (isError || !checkoutInfo || checkoutInfo.quantity === 0) {
    return (
      <ErrorState
        label={
          isError
            ? getErrorMessage(checkoutInfoError, "Unable to prepare checkout")
            : "Unable to prepare checkout"
        }
      />
    );
  }

  const cancelPayment = () => {
    setShowCancelBox(true);
  };

  const confirmCancelPayment = () => {
    setShowCancelBox(false);
    setPaymentCanceled(true);
  };

  const confirmOrder = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedAddress = newAddress.trim();

    const phoneRegex = /^0\d{10}$/;
    const nameRegex = /^\S+\s+\S+(?:\s+\S+)*$/;

    const newErrors = {
      fullName: "",
      phoneNumber: "",
      address: "",
    };

    if (!trimmedName) {
      newErrors.fullName = "This field is required.";
    } else if (!nameRegex.test(trimmedName)) {
      newErrors.fullName = "Please enter both your first and last name.";
    }

    if (!trimmedPhone) {
      newErrors.phoneNumber = "This field is required.";
    } else if (!phoneRegex.test(trimmedPhone)) {
      newErrors.phoneNumber = "Please enter a valid phone number.";
    }

    if (addressOption === "newAddress") {
      if (!trimmedAddress) {
        newErrors.address = "This field is required.";
      } else if (trimmedAddress.length < MIN_ADDRESS_LENGTH) {
        newErrors.address = `Address must be at least ${MIN_ADDRESS_LENGTH} characters.`;
      } else if (trimmedAddress.length > MAX_ADDRESS_LENGTH) {
        newErrors.address = `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`;
      }
    } else if (!checkoutInfo.address) {
      newErrors.address = "This field is required.";
    }

    setErrors(newErrors);

    if (newErrors.fullName || newErrors.phoneNumber || newErrors.address) {
      return;
    }

    setOrderError("");

    try {
      const orderData = {
        fullName: trimmedName,
        phoneNumber: trimmedPhone,
        address:
          addressOption === "myAddress"
            ? checkoutInfo.address
            : trimmedAddress,
      };

      await createOrder(orderData);

      setOrderCreated(true);
    } catch (error) {
      setOrderError(getErrorMessage(error, "Failed to create order."));
    }
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutContainer}>
        <h1 className={styles.title}>Checkout</h1>

        {orderCreated ? (
          <div className={styles.successCard}>
            <h2>Order Successfully Placed</h2>

            <p>
              Your order has been successfully placed. You can manage and track
              your order from here.
            </p>

            <Link to="/orders" className={styles.ordersLink}>
              Manage & Track Orders
            </Link>
          </div>
        ) : !paymentCanceled ? (
          <div className={styles.checkoutCard}>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Items</span>

                <span className={styles.summaryValue}>
                  {checkoutInfo.quantity}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total price</span>

                <span className={styles.summaryValue}>
                  ${checkoutInfo.totalPrice}
                </span>
              </div>
            </div>

            <div className={styles.form}>
              <div className={styles.field}>
                <label>Full name</label>

                <input
                  type="text"
                  value={fullName}
                  className={errors.fullName ? styles.inputError : ""}
                  onChange={(e) => {
                    setFullName(e.target.value);

                    if (e.target.value.trim() !== "") {
                      setErrors((prev) => ({
                        ...prev,
                        fullName: "",
                      }));
                    }
                  }}
                  placeholder="Enter your full name"
                  required
                />

                {errors.fullName && (
                  <span className={styles.errorMessage}>{errors.fullName}</span>
                )}
              </div>

              <div className={styles.field}>
                <label>Phone number</label>

                <input
                  type="tel"
                  value={phoneNumber}
                  className={errors.phoneNumber ? styles.inputError : ""}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);

                    if (e.target.value.trim() !== "") {
                      setErrors((prev) => ({
                        ...prev,
                        phoneNumber: "",
                      }));
                    }
                  }}
                  placeholder="Enter your phone number"
                  required
                />

                {errors.phoneNumber && (
                  <span className={styles.errorMessage}>
                    {errors.phoneNumber}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label>Address</label>

                <InlineDropdown
                  id="checkout-address"
                  value={addressOption}
                  options={[
                    ...(checkoutInfo.address
                      ? [{ value: "myAddress", label: checkoutInfo.address }]
                      : [{ value: "myAddress", label: "Select an address" }]),
                    { value: "newAddress", label: "Add a New Address" },
                  ]}
                  onChange={(value) => {
                    setAddressOption(value);
                    setErrors((prev) => ({ ...prev, address: "" }));
                  }}
                />

                {errors.address && addressOption === "myAddress" && (
                  <span className={styles.errorMessage}>{errors.address}</span>
                )}
              </div>

              {addressOption === "newAddress" && (
                <div className={styles.field}>
                  <label>New Address</label>

                  <textarea
                    value={newAddress}
                    className={errors.address ? styles.inputError : ""}
                    minLength={MIN_ADDRESS_LENGTH}
                    maxLength={MAX_ADDRESS_LENGTH}
                    aria-describedby="address-help address-error"
                    onChange={(e) => {
                      setNewAddress(e.target.value);

                      if (
                        e.target.value.trim().length >= MIN_ADDRESS_LENGTH &&
                        e.target.value.trim().length <= MAX_ADDRESS_LENGTH
                      ) {
                        setErrors((prev) => ({
                          ...prev,
                          address: "",
                        }));
                      }
                    }}
                    placeholder="Enter your new address"
                    rows={3}
                    required
                  />

                  <div id="address-help" className={styles.characterCount}>
                    {newAddress.length} / {MAX_ADDRESS_LENGTH} characters
                    <span>Minimum {MIN_ADDRESS_LENGTH} characters</span>
                  </div>

                  {errors.address && (
                    <span id="address-error" className={styles.errorMessage}>
                      {errors.address}
                    </span>
                  )}
                </div>
              )}
            </div>

            {orderError && (
              <p className={styles.errorMessage}>{orderError}</p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={cancelPayment}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmButton}
                onClick={confirmOrder}
              >
                Confirm Order
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.cancelSuccess}>
            <h2>Payment Canceled</h2>

            <p>Your payment has been canceled successfully.</p>

            <Link to="/orders" className={styles.ordersLink}>
              Go to Orders
            </Link>
          </div>
        )}

        {showCancelBox && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Cancel Payment?</h2>

              <p>Are you sure you want to cancel this payment?</p>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.keepButton}
                  onClick={() => setShowCancelBox(false)}
                >
                  Keep Payment
                </button>

                <button
                  type="button"
                  className={styles.confirmCancelButton}
                  onClick={confirmCancelPayment}
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}