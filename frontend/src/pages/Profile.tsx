import { useState } from "react";
import styles from "./Profile.module.css";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserInfo,
  updateAddress,
  updateEmail,
  updateFullName,
  updatePhoneNumber,
} from "../api/profileApi";
import type { ProfileInfoType } from "../api/profileApi";
import { getErrorMessage } from "../lib/getErrorMessage";

type EditableField = "full_name" | "email" | "phone_number" | "address";

export default function Profile() {
  const queryClient = useQueryClient();

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [inputValue, setInputValue] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [validationError, setValidationError] = useState("");
  const [addressFieldError, setAddressFieldError] = useState("");

  const openForm = (field: EditableField, currentValue: string | null) => {
    setEditingField(field);
    setInputValue(currentValue ?? "");
    setValidationError("");
    setAddressFieldError("");
  };

  const closeForm = () => {
    setEditingField(null);
    setInputValue("");
    setValidationError("");
    setAddressFieldError("");
    fullNameMutation.reset();
    emailMutation.reset();
    phoneNumberMutation.reset();
    addressMutation.reset();
  };

  const applyServerUpdate = (updated: Partial<ProfileInfoType>) => {
    queryClient.setQueryData<ProfileInfoType>(["user-info"], (old) =>
      old ? { ...old, ...updated } : old
    );
    closeForm();
  };

  const fullNameMutation = useMutation({
    mutationFn: updateFullName,
    onSuccess: applyServerUpdate,
  });

  const emailMutation = useMutation({
    mutationFn: updateEmail,
    onSuccess: applyServerUpdate,
  });

  const phoneNumberMutation = useMutation({
    mutationFn: updatePhoneNumber,
    onSuccess: applyServerUpdate,
  });

  const addressMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: applyServerUpdate,
  });

  const changeFullName = () => {
    const value = inputValue.trim();

    if (!value) {
      setValidationError("This field is required.");
      return;
    }

    setValidationError("");
    fullNameMutation.mutate(value);
  };

  const changeEmail = () => {
    const value = inputValue.trim();

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      setValidationError("This field is required.");
      return;
    }

    if (!EMAIL_REGEX.test(value)) {
      setValidationError("Invalid email.");
      return;
    }

    setValidationError("");
    emailMutation.mutate(value);
  };

  const changePhoneNumber = () => {
    const value = inputValue.trim();

    const PHONE_REGEX = /^09\d{9}$/;

    if (!value) {
      setValidationError("This field is required.");
      return;
    }

    if (!PHONE_REGEX.test(value)) {
      setValidationError("Invalid phone number.");
      return;
    }

    setValidationError("");
    phoneNumberMutation.mutate(value);
  };

  const changeAddress = () => {
    const addressFields = [
      { value: street, name: "Street address" },
      { value: city, name: "City" },
      { value: state, name: "State / Province" },
      { value: postalCode, name: "Postal code" },
      { value: country, name: "Country" },
    ];

    const emptyField = addressFields.find(
      (field) => !field.value.trim()
    );

    if (emptyField) {
      setAddressFieldError(emptyField.name);
      return;
    }

    const POSTAL_CODE_REGEX = /^\d{10}$/;

    if (!POSTAL_CODE_REGEX.test(postalCode.trim())) {
      setAddressFieldError("Postal code");
      return;
    }

    const address = [
      street,
      city,
      state,
      postalCode,
      country,
    ]
      .map((value) => value.trim())
      .join(", ");

    setValidationError("");
    setAddressFieldError("");
    addressMutation.mutate(address);
  };

  const {
    data: userInfo,
    isLoading,
    isError,
    error: userInfoError,
  } = useQuery({
    queryKey: ["user-info"],
    queryFn: fetchUserInfo,
  });

  if (isError) {
    return <ErrorState label={getErrorMessage(userInfoError, "Unable to load your profile")} />;
  }

  return (
    <main className={styles.profilePage}>
      {isLoading ? (
        <LoadingState label="Loading your profile" />
      ) : !userInfo ? (
        <ErrorState label="Unable to load your profile" />
      ) : (
        <div className={styles.profileContainer}>
          <h1 className={styles.title}>Profile</h1>

          <img
            alt="avatar"
            src={userInfo.avatar_url}
            className={styles.avatar}
          />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Full Name</h2>
            <p className={styles.info}>{userInfo.full_name}</p>

            {editingField === "full_name" ? (
              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  changeFullName();
                }}
              >
                <label className={styles.formLabel} htmlFor="full-name-input">
                  New full name
                </label>

                <input
                  id="full-name-input"
                  type="text"
                  className={`${styles.input} ${
                    validationError ? styles.inputError : ""
                  }`}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Enter your full name"
                  autoFocus
                  required
                />

                {validationError && (
                  <p className={styles.validationError}>{validationError}</p>
                )}

                {fullNameMutation.isError && (
                  <p className={styles.formError}>
                    {getErrorMessage(
                      fullNameMutation.error,
                      "Could not update full name. Please try again.",
                    )}
                  </p>
                )}

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.confirmButton}
                    disabled={fullNameMutation.isPending}
                  >
                    {fullNameMutation.isPending ? "Saving..." : "Confirm"}
                  </button>

                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={closeForm}
                    disabled={fullNameMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className={styles.button}
                onClick={() => openForm("full_name", userInfo.full_name)}
              >
                Change
              </button>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>

            <div className={styles.infoGroup}>
              <h3 className={styles.label}>Email</h3>
              <p className={styles.info}>{userInfo.email}</p>

              {editingField === "email" ? (
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    changeEmail();
                  }}
                >
                  <label className={styles.formLabel} htmlFor="email-input">
                    New email
                  </label>

                  <input
                    id="email-input"
                    type="email"
                    className={`${styles.input} ${
                      validationError || emailMutation.isError ? styles.inputError : ""
                    }`}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setValidationError("");
                      emailMutation.reset();
                    }}
                    placeholder="name@example.com"
                    autoFocus
                    required
                  />

                  {validationError && (
                    <p className={styles.validationError}>{validationError}</p>
                  )}

                  {emailMutation.isError && (
                    <p className={styles.formError}>
                      {getErrorMessage(
                        emailMutation.error,
                        "Could not update email. Please try again.",
                      )}
                    </p>
                  )}

                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.confirmButton}
                      disabled={emailMutation.isPending}
                    >
                      {emailMutation.isPending ? "Saving..." : "Confirm"}
                    </button>

                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={closeForm}
                      disabled={emailMutation.isPending}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => openForm("email", userInfo.email)}
                >
                  Change Email
                </button>
              )}
            </div>

            <div className={styles.infoGroup}>
              <h3 className={styles.label}>Phone Number</h3>

              {userInfo.phone_number ? (
                <p className={styles.info}>{userInfo.phone_number}</p>
              ) : (
                <p className={styles.missingInfo}>No phone number added</p>
              )}

              {editingField === "phone_number" ? (
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    changePhoneNumber();
                  }}
                >
                  <label className={styles.formLabel} htmlFor="phone-input">
                    New phone number
                  </label>

                  <input
                    id="phone-input"
                    type="tel"
                    className={`${styles.input} ${
                      validationError || phoneNumberMutation.isError ? styles.inputError : ""
                    }`}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setValidationError("");
                      phoneNumberMutation.reset();
                    }}
                    placeholder="09xxxxxxxxx"
                    autoFocus
                    required
                  />

                  {validationError && (
                    <p className={styles.validationError}>{validationError}</p>
                  )}

                  {phoneNumberMutation.isError && (
                    <p className={styles.formError}>
                      {getErrorMessage(
                        phoneNumberMutation.error,
                        "Could not update phone number. Please try again.",
                      )}
                    </p>
                  )}

                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.confirmButton}
                      disabled={phoneNumberMutation.isPending}
                    >
                      {phoneNumberMutation.isPending ? "Saving..." : "Confirm"}
                    </button>

                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={closeForm}
                      disabled={phoneNumberMutation.isPending}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => openForm("phone_number", userInfo.phone_number)}
                >
                  {userInfo.phone_number ? "Change" : "Add"}
                </button>
              )}
            </div>

            <div className={styles.infoGroup}>
              <h3 className={styles.label}>Address</h3>

              {userInfo.address ? (
                <p className={styles.info}>{userInfo.address}</p>
              ) : (
                <p className={styles.missingInfo}>No address added</p>
              )}

              {editingField === "address" ? (
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    changeAddress();
                  }}
                >
                  <label className={styles.formLabel} htmlFor="street-input">
                    Street Address
                  </label>

                  <input
                    id="street-input"
                    type="text"
                    className={`${styles.input} ${addressFieldError === "Street address" ? styles.inputError : ""}`}
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      setAddressFieldError("");
                      setValidationError("");
                    }}
                    placeholder="Street address"
                    autoFocus
                    required
                  />
                  {addressFieldError === "Street address" && (
                    <p className={styles.validationError}>This field is required.</p>
                  )}

                  <label className={styles.formLabel} htmlFor="city-input">
                    City
                  </label>

                  <input
                    id="city-input"
                    type="text"
                    className={`${styles.input} ${addressFieldError === "City" ? styles.inputError : ""}`}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setAddressFieldError("");
                      setValidationError("");
                    }}
                    placeholder="City"
                    required
                  />
                  {addressFieldError === "City" && (
                    <p className={styles.validationError}>This field is required.</p>
                  )}

                  <label className={styles.formLabel} htmlFor="state-input">
                    State / Province
                  </label>

                  <input
                    id="state-input"
                    type="text"
                    className={`${styles.input} ${addressFieldError === "State / Province" ? styles.inputError : ""}`}
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setAddressFieldError("");
                      setValidationError("");
                    }}
                    placeholder="State or province"
                    required
                  />
                  {addressFieldError === "State / Province" && (
                    <p className={styles.validationError}>This field is required.</p>
                  )}

                  <label
                    className={styles.formLabel}
                    htmlFor="postal-code-input"
                  >
                    Postal Code
                  </label>

                  <input
                    id="postal-code-input"
                    type="text"
                    className={`${styles.input} ${addressFieldError === "Postal code" ? styles.inputError : ""}`}
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      setAddressFieldError("");
                      setValidationError("");
                    }}
                    placeholder="Postal code"
                    required
                  />
                  {addressFieldError === "Postal code" && (
                    <p className={styles.validationError}>
                      {postalCode.trim() ? "Invalid postal code." : "This field is required."}
                    </p>
                  )}

                  <label className={styles.formLabel} htmlFor="country-input">
                    Country
                  </label>

                  <input
                    id="country-input"
                    type="text"
                    className={`${styles.input} ${addressFieldError === "Country" ? styles.inputError : ""}`}
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setAddressFieldError("");
                      setValidationError("");
                    }}
                    placeholder="Country"
                    required
                  />
                  {addressFieldError === "Country" && (
                    <p className={styles.validationError}>This field is required.</p>
                  )}

                  {validationError && !addressFieldError && (
                    <p className={styles.validationError}>{validationError}</p>
                  )}

                  {addressMutation.isError && (
                    <p className={styles.formError}>
                      {getErrorMessage(
                        addressMutation.error,
                        "Could not update address. Please try again.",
                      )}
                    </p>
                  )}

                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.confirmButton}
                      disabled={addressMutation.isPending}
                    >
                      {addressMutation.isPending ? "Saving..." : "Confirm"}
                    </button>

                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={closeForm}
                      disabled={addressMutation.isPending}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => openForm("address", userInfo.address)}
                >
                  {userInfo.address ? "Edit Address" : "Add Address"}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
