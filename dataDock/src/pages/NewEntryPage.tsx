// import { TextField, Button } from "@mui/material"; // not req as using T
//import axios from "axios";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom"; // detect edit mode
import { useNavigate } from "react-router-dom";
import "../status.css";
import AsyncSelect from "react-select/async";
import { asyncSelectStyles } from "../styles/asyncSelectStyle";

// for autocompete city name option
interface CityOption {
  value: number;
  label: string;
  cityName: string;
  stateId: number;
  stateName: string;
}

type FormData = {
  entryDate: string;

  name: string;
  codeName: string;

  stateId: string;
  cityId: string;

  pincodeId: string;

  phone1: string;
  phone2: string;

  officePhone1: string;
  officePhone2: string;

  bhawMD: string;
  bhawKRM: string;

  creditLimit: string;

  bazarId: string;

  referenceNumber: string;
  referenceName: string;

  remark: string;

  //adding option for pending, recoved and status for customer
  pendingAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  recoveryRemark: string;
  status: "ACTIVE" | "INACTIVE" | "RESTRICTED";
  isActive: boolean;

  cityName: string;
  stateName: string;
  // new column
  byWhom: string;
  codeNum: string;
};

type StateType = {
  id: number;
  name: string;
  code: string;
};

type CityType = {
  id: number;
  name: string;
  stateId: number;
};

type PincodeType = {
  id: number;
  cityId: number;
  areaName: string;
  pinCode: number;
};

//empty form data tobe loaded when "new" is clicked
// const emptyFormData: FormData = {
//   entryDate: new Date().toISOString().split("T")[0],

//   name: "",
//   codeName: "",

//   stateId: "",
//   cityId: "",
//   pincodeId: "",

//   phone1: "",
//   phone2: "",

//   officePhone1: "",
//   officePhone2: "",

//   bhawMD: "",
//   bhawKRM: "",

//   creditLimit: "",

//   bazarId: "",

//   referenceNumber: "",
//   referenceName: "",

//   remark: "",
// };

const NewEntryPage = () => {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [pincodes, setPincodes] = useState<PincodeType[]>([]);
  // hold searchterm for filling city name as per user char keypress
  // const [citySearch, setCitySearch] = useState("");
  // const [citySuggestions, setCitySuggestions] = useState([]);

  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);

  //for adding defaulter customer
  // for loading All or Defaulter list
  const { mode } = useParams();
  const isDefaulterMode = mode === "defaulter";

  //for Working vs suspended
  const [originalIsActive, setOriginalIsActive] = useState<boolean>(true);
  const [originalRecoveryRemark, setOriginalRecoveryRemark] =
    useState<string>("");

  // commented as created emptyfordata object
  const [formData, setFormData] = useState<FormData>({
    entryDate: new Date().toISOString().split("T")[0],

    name: "",
    codeName: "",

    stateId: "",
    cityId: "",
    pincodeId: "",

    phone1: "",
    phone2: "",

    officePhone1: "",
    officePhone2: "",

    bhawMD: "",
    bhawKRM: "",

    creditLimit: "",

    bazarId: "",

    referenceNumber: "",
    referenceName: "",

    remark: "",

    // adding option for pending amount, recoved amount, status
    pendingAmount: 0,
    receivedAmount: 0,
    outstandingAmount: 0,
    recoveryRemark: "",
    status: "ACTIVE",

    //for working vs suspended customer
    isActive: true,

    cityName: "",
    stateName: "",
    byWhom: "",
    codeNum: "",
  });

  // const [formData, setFormData] = useState<FormData>(emptyFormData);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    const phoneFields = [
      "phone1",
      "phone2",
      "officePhone1",
      "officePhone2",
      "codeNum",
    ];
    if (phoneFields.includes(name)) {
      const regex = /^[0-9+\-\/ ]*$/;

      if (!regex.test(value)) {
        return;
      }
    }

    // Reset city + pincode when state changes
    if (name === "stateId") {
      setFormData((prev) => ({
        ...prev,
        stateId: value,
        cityId: "",
        pincodeId: "",
      }));

      return;
    }

    // Reset pincode when city changes
    if (name === "cityId") {
      setFormData((prev) => ({
        ...prev,
        cityId: value,
        pincodeId: "",
      }));

      return;
    }

    if (["pendingAmount", "receivedAmount"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    if (name === "isActive") {
      setFormData((prev) => ({
        ...prev,
        isActive: value === "true",
      }));
      return;
    }

    // Normal updates
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      // will be for edit mode only
      return;
    }

    try {
      const payload = {
        ...formData,

        //for pending/defaulter codeName is null
        codeName: isDefaulterMode ? null : formData.codeName,

        stateId: formData.stateId ? Number(formData.stateId) : null,

        cityId: formData.cityId ? Number(formData.cityId) : null,

        pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,

        // bazarId: formData.bazarId ? Number(formData.bazarId) : null,

        bazarId: formData.bazarId || null,

        creditLimit: formData.creditLimit ? Number(formData.creditLimit) : null,

        //if adding defaulter make this record isActive to false
        isActive: isDefaulterMode
          ? false
          : isEditMode
            ? formData.isActive
            : true,
      };

      setLoading(true);

      // console.log("UPDATE DATA:", {
      //   ...payload,
      //   pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,
      // });
      // console.log(
      //   `current Editmode is: ${isEditMode} and isDefaulter is: ${isDefaulterMode}`,
      // );
      // console.log(
      //   `Default Mode is: ${isDefaulterMode} and codeName:${formData.codeName} and payload: ${payload.codeName}`,
      // );

      if (isEditMode) {
        // console.log(`record updateding for: ${payload}`);
        await api.put(`api/records/${id}`, payload);
        //alert("Record created successfully");
        toast.success("Record updated successfully");
        isDefaulterMode ? navigate("/search/false") : navigate("/search/true");
      } else {
        await api.post("api/records", payload);
        //alert("Record created successfully");
        toast.success("Record created successfully");
      }

      // console.log("FormData:", formData);
      // clear field for edit as well
      // if (!isEditMode) {
      setFormData({
        entryDate: new Date().toISOString().split("T")[0],

        name: "",
        codeName: "",

        stateId: "",
        stateName: "",
        cityId: "",
        cityName: "",
        pincodeId: "",

        phone1: "",
        phone2: "",

        officePhone1: "",
        officePhone2: "",

        bhawMD: "",
        bhawKRM: "",

        creditLimit: "",

        bazarId: "",

        referenceNumber: "",
        referenceName: "",

        remark: "",

        //update pending, recoved and status
        // adding option for pending amount, recoved amount, status
        pendingAmount: 0,
        receivedAmount: 0,
        outstandingAmount: 0,
        recoveryRemark: "",
        status: "ACTIVE",
        isActive: true,
        byWhom: "",
        codeNum: "",
      });
      // set focus on name
      nameInputRef.current?.focus();

      //clear off city dropdown
      setSelectedCity(null);
      // }
    } catch (error) {
      console.error(error);

      //alert("Failed to create record");
      toast.error("Failed to create record");
    } finally {
      setLoading(false);
    }
  };

  //search city name based on searchterem
  // const handleCitySearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;

  //   setCitySearch(value);
  //   console.log("citySearch", citySearch);

  //   if (value.length < 2) {
  //     setCitySuggestions([]);
  //     console.log("citySuggestions:", citySuggestions);
  //     return;
  //   }

  //   const response = await api.get(`/cities/search?q=${value}`);

  //   setCitySuggestions(response.data);
  // };

  // const selectCity = async (city: any) => {
  //   setCitySearch(city.name);

  //   setFormData((prev) => ({
  //     ...prev,
  //     cityId: city.id,
  //     stateId: city.stateId,
  //   }));

  //   setCitySuggestions([]);

  //   // Load pincodes
  //   const response = await api.get(`/pincodes/city/${city.id}`);

  //   setPincodes(response.data);
  // };

  // for autcompleete cityname
  const loadCityOptions = async (inputValue: string): Promise<CityOption[]> => {
    if (inputValue.length < 2) {
      return [];
    }

    try {
      const response = await api.get(`/cities/search?q=${inputValue}`);
      // console.log("city response:", response.data);
      return response.data.map((city: any) => ({
        value: city.id,
        label: `${city.name.toUpperCase()} (${city.state.name.toUpperCase()})`,
        stateId: city.stateId,
        stateName: city.state.name,
      }));
    } catch (error) {
      console.error("Failed to search cities", error);
      return [];
    }
  };

  const handleCitySelect = async (selectedOption: CityOption | null) => {
    if (!selectedOption) {
      return;
    }

    setSelectedCity(selectedOption);

    setFormData((prev) => ({
      ...prev,
      cityId: String(selectedOption.value),
      cityName: selectedOption.label,
      stateId: String(selectedOption.stateId),
      stateName: selectedOption.stateName,

      pincodeId: "",
    }));

    // value: number;
    // label: string;
    // cityName: string;
    // stateId: number;
    // stateName: string;
    try {
      const response = await api.get(`/pincodes/${selectedOption.value}`);

      setPincodes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // for autocomplete
  // useEffect(() => {
  //   if (!isEditMode) return;
  //   if (!formData.cityId) return;

  //   setSelectedCity({
  //     value: Number(formData.cityId),
  //     label: `${formData.cityName} (${formData.stateName})`,
  //     //label: `${formData.cityId} (${formData.cityId})`,
  //     stateId: Number(formData.stateId),
  //     stateName: formData.stateName,
  //     cityName: formData.cityName,
  //   });
  // }, [
  //   isEditMode,
  //   formData.cityId,
  //   formData.cityName,
  //   formData.stateId,
  //   formData.stateName,
  // ]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        // const response = await axios.get("http://localhost:5000/states");
        // console.log(`API url is:`, api.defaults.baseURL);
        const response = await api.get("/states");
        // console.log(`Fetching state from ${response.data}`);
        //alert(`Fetching state from db: ${response}`);
        setStates(response.data);
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    if (!formData.stateId) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      try {
        // const response = await axios.get(
        //   `http://localhost:5000/cities/${formData.stateId}`,
        // );
        const response = api.get(`/cities/${formData.stateId}`);
        setCities((await response).data);
        // alert(`Fetching cities from db: ${response}`);
      } catch (error) {
        console.error("Failed to fetch cities", error);
      }
    };

    fetchCities();
  }, [formData.stateId]);

  useEffect(() => {
    console.log(cities);
    if (!formData.cityId) {
      setPincodes([]);
      return;
    }

    const fetchPincodes = async () => {
      try {
        // const response = await axios.get(
        //   `http://localhost:5000/pincodes/${formData.cityId}`,
        // );
        const response = api.get(`/pincodes/${formData.cityId}`);
        //alert(`Fetching pincodes from db: ${response}`);
        const cityPinCodes = await response;
        // console.log("Loading pincode for:", cityPinCodes.data);
        setPincodes(cityPinCodes.data);
      } catch (error) {
        console.error("Failed to fetch pincodes", error);
      }
    };

    fetchPincodes();
  }, [formData.cityId]);

  // pattern validation
  // const patternValidation = "[0-9+\\-/ ]*";
  // const codeNumValidation = "[0-9+\\-/ ]*";
  const nameInputRef = useRef<HTMLInputElement>(null);
  // highlight active field
  // const inputClass =
  //   "w-full rounded border p-3 text-medium font-semibold focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const inputClass =
    "w-full rounded border p-3 text-medium font-semibold text-#1e3a8a-700 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "mb-1 block text-xl text-#4f3dd9-800 font-bold";

  useEffect(() => {
    nameInputRef.current?.focus();
    // console.log("isActive:", formData.isActive);
    // console.log("isActive type:", typeof formData.isActive);
    // console.log("isActive value:", JSON.stringify(formData.isActive));
  }, []);

  useEffect(() => {
    // console.log(`loading for defaulter: ${isDefaulterMode}`);
  }, [isDefaulterMode]);

  // for Edit record
  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      try {
        const response = await api.get(`api/records/${id}`);

        const record = response.data;

        //for loading city asyncSelect
        setSelectedCity({
          value: Number(record.cityId),
          label: `${record.cityName.toUpperCase()} (${record.stateName.toUpperCase()})`,
          cityName: record.cityName,
          stateId: Number(record.stateId),
          stateName: record.stateName,
        });
        //on loading set userstate
        setOriginalIsActive(Boolean(record.isActive));
        setOriginalRecoveryRemark(record.remark);

        setFormData({
          entryDate: record.entryDate?.split("T")[0] ?? "",

          name: record.name ?? "",
          codeName: record.codeName ?? "",

          stateId: String(record.stateId ?? ""),
          stateName: "",
          cityId: String(record.cityId ?? ""),
          cityName: "",
          pincodeId: String(record.pincodeId ?? ""),

          phone1: record.phone1 ?? "",
          phone2: record.phone2 ?? "",

          officePhone1: record.officePhone1 ?? "",
          officePhone2: record.officePhone2 ?? "",

          bhawMD: record.bhawMD ?? "",
          bhawKRM: record.bhawKRM ?? "",

          creditLimit: String(record.creditLimit ?? ""),

          bazarId: record.bazarId ?? "",

          referenceNumber: record.referenceNumber ?? "",
          referenceName: record.referenceName ?? "",

          remark: record.remark ?? "",

          // adding option for pending amount, recoved amount, status
          pendingAmount: record.pendingAmount ?? 0,
          receivedAmount: record.receivedAmount ?? 0,
          outstandingAmount:
            Number(record.pendingAmount || 0) -
            Number(record.receivedAmount || 0),
          recoveryRemark: record.recoveryRemark || "",
          status: record.status || "ACTIVE",
          isActive: Boolean(record.isActive),
          byWhom: record.byWhom ?? "",
          codeNum: record.codeNum ?? "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load record");
      }
    };

    fetchRecord();
  }, [id]);

  // useEffect(() => {
  //   console.log("selectedCity changed:", selectedCity);
  // }, [selectedCity]);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    // // Allow multiline remarks
    // if (e.target instanceof HTMLTextAreaElement) {
    //   return;
    // }

    // console.log({
    //   key: e.key,
    //   ctrl: e.ctrlKey,
    //   shift: e.shiftKey,
    //   meta: e.metaKey,
    //   target: e.target,
    // });

    if (e.target instanceof HTMLTextAreaElement) {
      if (e.ctrlKey || e.metaKey) {
        return; // allow newline
      }

      e.preventDefault();
      e.currentTarget.requestSubmit();
      return;
    }
    e.preventDefault();

    (e.currentTarget as HTMLFormElement).requestSubmit();
  };

  useEffect(() => {
    const pending = Number(formData.pendingAmount || 0);

    const received = Number(formData.receivedAmount || 0);

    const outstanding = pending - received;

    let status: FormData["status"] = "ACTIVE";

    if (pending > 0) {
      if (received === 0) {
        status = "INACTIVE";
      } else if (outstanding > 0) {
        status = "RESTRICTED";
      }
    }

    setFormData((prev) => ({
      ...prev,
      outstandingAmount: outstanding,
      status,
    }));
  }, [formData.pendingAmount, formData.receivedAmount]);

  const validateForm = () => {
    if (
      isEditMode &&
      formData.isActive !== originalIsActive &&
      formData.recoveryRemark?.trim() === originalRecoveryRemark?.trim()
    ) {
      alert("Recovery Remark is mandatory when Customer Status is changed.");
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl border-2 border-slate-500 bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold text-[#1E40AF]">
          {!isDefaulterMode
            ? isEditMode
              ? "Customer Edit"
              : "Customer Entry"
            : "Pending Entry"}
        </h1>

        <form
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="grid grid-cols-1  gap-5 md:grid-cols-2"
        >
          {/* {For Customer Status as WORKING SUSPENDED} */}
          {isEditMode && (
            <div>
              <label className={labelClass}>CUSTOMER STATUS</label>

              {/* <select
                name="isActive"
                value={String(formData.isActive)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
                className={`w-full rounded border p-3 font-semibold ${
                  formData.isActive
                    ? "bg-green-400 text-black"
                    : "bg-red-400 text-white"
                }`}
              >
                <option value="WORKING">WORKING</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select> */}
              <select
                name="isActive"
                value={String(formData.isActive)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
                className={`w-full rounded border p-3 font-semibold ${
                  formData.isActive
                    ? "bg-green-400 text-black"
                    : "bg-red-400 text-white"
                }`}
              >
                <option value="true">WORKING</option>
                <option value="false">SUSPENDED</option>
              </select>
            </div>
          )}
          {/* Entry Date */}
          <div>
            <label className={labelClass}>ENTRY DATE</label>

            <input
              type="date"
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Name */}
          <div>
            <label className={labelClass}>NAME</label>

            <input
              ref={nameInputRef}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* codeNum */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>CODE NUMBER</label>

              <input
                type="text"
                name="codeNum"
                value={formData.codeNum}
                onChange={handleChange}
                placeholder=""
                //pattern={codeNumValidation}
                className={inputClass}
              />
            </div>
          )}
          {/* Code Name */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>CODE NAME</label>

              <input
                type="text"
                name="codeName"
                value={formData.codeName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}

          {/* City */}
          {!isDefaulterMode && (
            // <div>
            //   <label className={labelClass}>CITY</label>

            //   <select
            //     name="cityId"
            //     value={formData.cityId}
            //     onChange={handleChange}
            //     className={inputClass}
            //   >
            //     <option value="">Select City</option>

            //     {cities.map((city) => (
            //       <option key={city.id} value={city.id}>
            //         {city.name.toUpperCase()}
            //       </option>
            //     ))}
            //   </select>
            // </div>
            // <div className="relative">
            //   <input
            //     type="text"
            //     value={citySearch}
            //     onChange={handleCitySearch}
            //     placeholder="Search City"
            //     className={inputClass}
            //   />

            //   {citySuggestions.length > 0 && (
            //     <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-auto">
            //       {citySuggestions.map((city) => (
            //         <li
            //           key={city.id}
            //           className="p-2 hover:bg-gray-100 cursor-pointer"
            //           onClick={() => selectCity(city)}
            //         >
            //           {city.name} ({city.state.name})
            //         </li>
            //       ))}
            //     </ul>
            //   )}
            // </div>
            // autocomplete city name
            <div>
              <label className={labelClass}>CITY</label>

              <AsyncSelect
                cacheOptions
                defaultOptions={false}
                loadOptions={loadCityOptions}
                onChange={handleCitySelect}
                placeholder="Type city name..."
                noOptionsMessage={() => "Start typing city name"}
                styles={asyncSelectStyles}
                // classNamePrefix="react-select"
                value={selectedCity}
              />
            </div>
          )}

          {/* State */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>STATE</label>

              <select
                name="stateId"
                disabled
                value={formData.stateId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select State</option>

                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pincode */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>PINCODE</label>

              <select
                name="pincodeId"
                value={formData.pincodeId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Pincode</option>

                {pincodes.map((pincode) => (
                  <option key={pincode.id} value={pincode.id}>
                    {pincode.pinCode} - {pincode.areaName.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Phone 1 */}
          <div>
            <label className={labelClass}>PHONE 1</label>

            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              //pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Phone 2 */}
          <div>
            <label className={labelClass}>PHONE 2</label>

            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              //pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Office Phone 1 */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>OFFICE PHONE 1</label>

              <input
                type="text"
                name="officePhone1"
                value={formData.officePhone1}
                onChange={handleChange}
                //pattern={patternValidation}
                className={inputClass}
              />
            </div>
          )}
          {/* Office Phone 2 */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>OFFICE PHONE 2</label>

              <input
                type="text"
                name="officePhone2"
                value={formData.officePhone2}
                onChange={handleChange}
                //pattern={patternValidation}
                className={inputClass}
              />
            </div>
          )}
          {/* Bhaw MD */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>BHAV MD</label>

              <input
                type="text"
                name="bhawMD"
                value={formData.bhawMD}
                onChange={handleChange}
                placeholder="1-0-1.2-4.5-3.2-0-0"
                className={inputClass}
              />
            </div>
          )}

          {/* Bhaw KRM */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>BHAV KRM</label>

              <input
                type="text"
                name="bhawKRM"
                value={formData.bhawKRM}
                onChange={handleChange}
                placeholder="1-0-1.2-4.5-3.2-0-0"
                className={inputClass}
              />
            </div>
          )}

          {/* Credit Limit */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>CREDIT LIMIT</label>

              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}

          {/* Bazar dropdown*/}
          {/* <div>
            <label className={labelClass}>Bazar</label>

            <select
              name="bazarId"
              value={formData.bazarId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Bazar</option>
            </select>
          </div> */}
          {/* Bazar */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>BAZAR</label>

              <input
                type="text"
                name="bazarId"
                value={formData.bazarId}
                onChange={handleChange}
                placeholder="Enter Bazar"
                className={inputClass}
              />
            </div>
          )}

          {/* Reference Name */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>REFERENCE NAME</label>

              <input
                type="text"
                name="referenceName"
                value={formData.referenceName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}

          {/* Reference Number */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>REFERENCE NUMBER</label>

              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}

          {/* byWhom */}
          {!isDefaulterMode && (
            <div>
              <label className={labelClass}>WHOM</label>

              <input
                type="text"
                name="byWhom"
                value={formData.byWhom}
                onChange={handleChange}
                placeholder="Ask by whom"
                className={inputClass}
              />
            </div>
          )}

          {/* Remark */}
          {!isDefaulterMode && (
            <div className="md:col-span-2">
              <label className={labelClass}>REMARK</label>
              {/* If customer status get updtaed on Edit screen Remark is mandatory */}
              {isEditMode && formData.isActive !== originalIsActive && (
                <span className="text-red-500"> *</span>
              )}

              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={4}
                // className={inputClass}
                className={`w-full rounded border p-3 text-medium font-semibold text-#1e3a8a-700 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isEditMode &&
                  formData.isActive !== originalIsActive &&
                  !formData.remark?.trim()
                    ? "border-red-500"
                    : ""
                }`}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter") {
                    e.preventDefault();

                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;

                    const newValue =
                      formData.remark.slice(0, start) +
                      "\n" +
                      formData.remark.slice(end);

                    setFormData((prev) => ({
                      ...prev,
                      remark: newValue,
                    }));
                  }
                }}
              />
            </div>
          )}

          {/* <div className="form-row"> */}
          {/* Pending amount */}
          {isDefaulterMode && (
            <div>
              <label className={labelClass}>PENDING AMOUNT</label>
              <input
                id="pendingAmount"
                name="pendingAmount"
                type="number"
                min="0"
                step="1000"
                value={formData.pendingAmount}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}

          {/* Received Amount */}
          {isDefaulterMode && (
            <div>
              <label className={labelClass}>RECEIVED AMOUNT</label>
              <input
                id="receivedAmount"
                name="receivedAmount"
                type="number"
                min="0"
                step="1000"
                value={formData.receivedAmount}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}
          {/* </div> */}

          {/* <div className="form-row"> */}
          {/* Outstanding amount */}
          {isDefaulterMode && (
            <div>
              <label className={labelClass}>OUTSTANDING AMOUNT</label>
              <input
                id="outstandingAmount"
                name="outstandingAmount"
                type="number"
                value={formData.outstandingAmount}
                readOnly
                disabled
                className={inputClass}
              />
            </div>
          )}

          {/* Status */}
          {isDefaulterMode && (
            <div>
              <label className={labelClass}>STATUS</label>
              <input
                id="status"
                name="status"
                type="text"
                value={formData.status}
                readOnly
                disabled
                // className={`status-${formData.status.toLowerCase()}`}
                className={`w-full rounded border p-3 text-medium font-semibold text-blue-700 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.status?.toLowerCase() === "active"
                    ? "bg-green-400"
                    : formData.status?.toLowerCase() === "restricted"
                      ? "bg-orange-300"
                      : "bg-red-400"
                }`}
              />
            </div>
          )}
          {/* </div> */}

          {/* Recovery remark */}
          {isDefaulterMode && (
            <div className="md:col-span-2">
              <label className={labelClass}>
                RECOVERY REMARK
                {isEditMode && formData.isActive !== originalIsActive && (
                  <span className="text-red-500"> *</span>
                )}
              </label>

              <textarea
                id="recoveryRemark"
                name="recoveryRemark"
                rows={4}
                value={formData.recoveryRemark}
                onChange={handleChange}
                placeholder="Enter recovery details, payment commitments, follow-up notes, etc."
                className={`w-full rounded border p-3 text-medium font-semibold text-#1e3a8a-700 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isEditMode &&
                  formData.isActive !== originalIsActive &&
                  !formData.recoveryRemark?.trim()
                    ? "border-red-500"
                    : ""
                }`}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter") {
                    e.preventDefault();

                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;

                    const newValue =
                      formData.recoveryRemark.slice(0, start) +
                      "\n" +
                      formData.recoveryRemark.slice(end);

                    setFormData((prev) => ({
                      ...prev,
                      recoveryRemark: newValue,
                    }));
                  }
                }}
              />
            </div>
          )}

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Record"
                  : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryPage;
