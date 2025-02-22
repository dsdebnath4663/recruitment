"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./create-job.css";
import {
  createJobOpening,
  fetchCountries,
  fetchIndustry,
  fetchJobStatus,
  fetchJobTypes,
  fetchLeads,
  fetchWorkExperience,

} from "@/utils/restClient";
import AddDepartmentModal from "@/components/modal/add-department/add-department";
import TokenizedTagInputForm from "@/components/tokenized-tag-input/TokenizedTagInputForm";
import TypeAheadDropdown from "@/components/TypeAheadDropdown/TypeAheadDropdown";
import { ValidationHelper } from "@/components/form-validator/ValidationHelper";
import StatusMessage from "@/components/status-message/StatusMessage";

export default function CreateJobOpening() {
  // 1) INITIAL STATES
  const initialState = {
    postingTitle: "",
    departmentName: "",
    title: "",
    hiringManager: "",
    assignedRecruiter: "",
    noOfPositions: "",
    targetDate: "",
    dateOpened: "",
    jobOpeningStatus: "",
    jobType: "",
    industry: "",
    workExperience: "",
    salary: "",
    skills: [],
    remoteJob: false,
    city: "",
    province: "",
    country: "",
    postalCode: "",
    jobDescription: "",
    requirements: "",
    benefits: "",
    jobSummary: null,
    otherAttachments: null,
  };

  const titles = [
    { id: 1, listValue: 'Developer' },
    { id: 2, listValue: 'Product Manager' },
    { id: 3, listValue: 'Product Lead' },
    { id: 4, listValue: 'Technical Manager' },
    { id: 5, listValue: 'Web Designer' }
  ]

  const assignedRecruiterOptions = ["test"];
  const salaryOptions = [];
  // const countryOptions = [];

  const [countryOptions, setCountries] = useState([]); // State to store countries

  // State to hold form data
  const [formData, setFormData] = useState(initialState);

  // State to hold errors for each field
  // If formErrors[fieldName] is an empty string, no error is present
  const [formErrors, setFormErrors] = useState({});

  // Track which fields have been touched or edited by the user
  // If touchedFields[fieldName] === true, it means the user has interacted with that field
  const [touchedFields, setTouchedFields] = useState({});

  // Submission state (you can use this to show a success message, etc.)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [status, setStatus] = useState(''); // State to track status (loading, success, error)
  const [errorMessage, setErrorMessage] = useState('');
  // 1. Main data in the parent
  const [data, setData] = useState({
    departmentName: "",
    parentDepartmentId: "",
    departmentLead: {
      firstName: "",
      lastName: "",
      email: "",
    },
    attachmentPath: "",
  });

  const [recruters, setRecruters] = useState([]);
  const [hiringManagerOptions, setHiringManagerOptions] = useState([]);
  const [jobOpeningStatusOptions, setJobOpeningStatusOptions] = useState([]);
  const [jobTypeOptions, setJobTypeOptions] = useState([]);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [workExperienceOptions, setworkExperienceOptions] = useState([]);


  // 2. Toggle whether the modal is visible or not
  const [showModal, setShowModal] = useState(false);

  // Function to open the modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to handle saving data from the modal

  const handleSaveData = (updatedData) => {
    setData(updatedData);
    // Optionally set formData again if needed when saving
    setFormData((prevFormData) => ({
      ...prevFormData,
      departmentName: updatedData.parentDepartmentId,
    }));
  };

  // 2) HELPER FUNCTIONS FOR DYNAMIC VALIDATION STYLES

  // Returns "" (empty) if the field is not touched yet,
  // "is-invalid" if there's an error, or "is-valid" if valid.
  const getValidationClass = (fieldName) => {
    if (!touchedFields[fieldName]) {
      return "";
    }
    return formErrors[fieldName] ? "is-invalid" : "is-valid";
  };

  // Returns "" if not touched, otherwise "invalid-feedback" or "valid-feedback".
  const getFeedbackClass = (fieldName) => {
    if (!touchedFields[fieldName]) {
      return "";
    }
    return formErrors[fieldName] ? "invalid-feedback" : "valid-feedback";
  };

  // Returns "" if not touched, otherwise the error message or "Looks good!".
  const getFeedbackMessage = (fieldName) => {
    if (!touchedFields[fieldName]) {
      return "";
    }
    return formErrors[fieldName] || "Looks good!";
  };



  // 3) VALIDATION LOGIC
  // 4) HANDLE INPUT CHANGES
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const newValue =
      // type === "file" ? files :
      type === "file" ? (files ? files[0] : null) : // Retrieve the first file
        type === "checkbox" ? checked : value;



    // Log the new value (based on input type)
    if (type === "file" && files && files.length > 0) {
      const file = files[0]; // Get the selected file (assuming single file)
      console.log(name + " : " + file.name); // Log the file details
    } else if (typeof newValue === 'object' && newValue !== null) {
      // If newValue is an object (including arrays), stringify and log it
      console.log(name + " : " + JSON.stringify(newValue, null, 2));
    } else {
      // If newValue is a primitive (string, number, or boolean), log it directly
      console.log(name + " : " + newValue);
    }


    // Update form data (asynchronously)
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: newValue };
      // Log the updated form data inside the setFormData callback to see the result
      console.log("Updated formData: ", updatedFormData);
      return updatedFormData;
    });



    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Validate the field
    const error = ValidationHelper.validateField(name, newValue, type);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };


  const buildPayload = () => {
    // Initialize the payload object
    const payload = {
      "postingTitle": formData.postingTitle,
      "title": formData.title.listValue,
      "assignedRecruiter": {
        "id": formData.assignedRecruiter.id,
      },
      "targetDate": formData.targetDate,
      "status": formData.jobOpeningStatus.listValue,
      "industry": formData.industry.listValue,
      "salary": formData.salary,
      "department": {
        "id": formData.departmentName
      },
      "hiringManager": {
        "id": formData.hiringManager.id
      },
      "dateOpened": formData.dateOpened,
      "jobType": formData.jobType.listValue,
      "requiredSkills": formData.skills,
      "addressInformation": {
        "isRemoteJob": formData.remoteJob,
        "city": formData.city,
        "province": formData.province,
        "country": formData.country.listValue,
        "postalCode": formData.postalCode
      },
      "descriptionInformation": {
        "jobDescription": formData.jobDescription,
        "requirements": formData.requirements,
        "benefits": formData.benefits,
      },
      "attachments": [],
      "workExperience": formData.workExperience
    }

    return payload;
  };
  async function createJobOpeningData(payload) {
    setStatus('loading'); // Set status to loading when the API call starts
    try {
      const jobOpening = await createJobOpening(payload); // Call the API function

      // If the job opening creation is successful (HTTP 200)
      setStatus('success'); // Set status to success if the API call is successful
      console.log('Job opening created successfully:', jobOpening.postingTitle);
    } catch (error) {
      // If any error occurs, capture the error message
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'An unexpected error occurred';

      // Log the error message to the console
      console.error('Error creating job opening:', errorMessage);

      // Set status to error and display the message
      setStatus('error');
      setErrorMessage(errorMessage); // Optionally set a state to display the error message to the user

    } finally {
      // Clear form fields after operation
      // setFormData(initialState);

      // Delay clearing the status and error message using setTimeout
      setTimeout(() => {
        setStatus('');
        setErrorMessage('');
      }, 10000); // Delay for 10 seconds before clearing the status and error message

    }
  }
  // 5) HANDLE FORM SUBMISSION
  const handleSubmit = (e) => {
    e.preventDefault();

    let valid = true;
    const errors = {};

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      const error = ValidationHelper.validateField(
        field,
        formData[field],
        typeof formData[field]
      );
      if (error) valid = false;
      errors[field] = error;
    });

    setFormErrors(errors);
    setTouchedFields(
      Object.keys(formData).reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {}
      )
    );

    if (valid) {
      setIsSubmitted(true);
      // Build the payload dynamically using the helper function
      const payload = buildPayload();
      console.log("payload ", payload)
      // Only call the service if required fields are valid
      if (Object.keys(payload).length > 0) {
        createJobOpeningData(payload);
        console.log("Form submitted successfully!");
      } else {
        console.log("Form contains no valid data");
      }
      alert("Form is valid and ready to submit!");
      console.log("Form Data:", formData);
    } else {
      setIsSubmitted(false);
      alert("Please fix the errors in the form before submitting.");
    }
  };
  // Log changes when `TokenizedTagInput` updates the `skills`
  //Parent (JobOpening ) toified from TokenizedTagInput
  const handleSkillsChange = (newTags) => {
    console.log("Previous form data:", formData);
    const updatedFormData = { ...formData, skills: newTags };
    console.log("Updated form data:", updatedFormData);
    setFormData(updatedFormData);
  };

  useEffect(() => {
    // Sync formData.departmentName (parent state variable ) with data.departmentName(child state variable )
    setFormData((prevFormData) => ({
      ...prevFormData,
      departmentName: data.departmentName, // Set the formData's departmentName to match data.departmentName
    }));

    // Fetch countries and positions
    async function fetchCountriesData() {
      try {
        const countriesData = await fetchCountries(); // Call the fetchCountries function
        const countryNames = countriesData.map((country, index) =>
        (
          {
            id: index + 1,  // Adding an id starting from 1
            listValue: country.name
          }
        )
        );
        console.log("countryNames ", countryNames);
        setCountries(countryNames); // Set the array of country names into state
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        setCountries([]); // Default to an empty array in case of error
      }
    }

    async function fetchJobTypesData() {
      try {
        const jobTypes = await fetchJobTypes();
        const jobTypesWithId = jobTypes.map((type, index) => ({
          id: index + 1,  // Adding an id starting from 1
          listValue: type
        }));
        console.log("jobTypes ", jobTypesWithId);
        setJobTypeOptions(jobTypesWithId);
      } catch (error) {
        console.error("Failed to fetch jobTypes:", error);
        setJobTypeOptions([]); // Default to an empty array in case of error
      }
    }

    async function fetchJobStatusData() {
      try {
        const jobStatus = await fetchJobStatus(); // Call the fetchCountries function

        const jobStatusesWithId = jobStatus.map((status, index) => ({
          id: index + 1,  // Adding an id starting from 1
          listValue: status
        }));

        console.log("jobStatusesWithId ", jobStatusesWithId);
        setJobOpeningStatusOptions(jobStatusesWithId);
      } catch (error) {
        console.error("Failed to fetch job status:", error);
        setJobOpeningStatusOptions([]); // Default to an empty array in case of error
      }
    }

    async function fetchRecruitersData() {
      try {
        const response = await fetchLeads();
        // console.log("fetchRecruitersData response : ", response);

        // Filter the users with the role "Recruiter" and extract the desired fields
        const recruters = response
          .filter((user) => user.role.name === "Recruiter")
          .map((user) => ({
            id: user.id,
            listValue: user.firstName + " " + user.lastName
          }));
        console.log("Extracted recruiters data : ", recruters);
        setRecruters(recruters); // Set the array of departments names into state



        const hiringManagers = response
          .filter((user) => user.role.name === "Hiring Manager")
          .map((user) => ({
            id: user.id,
            listValue: user.firstName + " " + user.lastName,
          }));



        // Push the filtered and transformed names into hiringManagerOptions
        console.log("hiringManagerOptions: ", hiringManagers);

        setHiringManagerOptions(hiringManagers);

        console.log("recruiters have been set into state");
      } catch (error) {
        console.error("Failed to fetch recruiters:", error);
        setRecruters([]); // Default to an empty array in case of error
        // hiringManagerOptions.push(...[])
        console.log("Setting empty recruiters array due to error");
      }
    }

    async function fetchIndustryData() {
      try {
        const response = await fetchIndustry(); // Call the fetchCountries function
        // console.log("IndustryData ", industryData)

        const industryData = response.map((type, index) => ({
          id: index + 1,  // Adding an id starting from 1
          listValue: type
        }));
        console.log("IndustryData ", industryData);
        setIndustryOptions(industryData);
      } catch (error) {
        console.error("Failed to fetch industry data:", error);
        setIndustryOptions([]); // Default to an empty array in case of error
      }
    }


    async function fetchWorkExperienceData() {
      try {
        const workExperienceRequiredOptions = await fetchWorkExperience(); // Call the fetchCountries function

        const workExperienceRequiredOptionsWithId = workExperienceRequiredOptions.map((experience, index) => ({
          id: index + 1,  // Adding an id starting from 1
          listValue: experience
        }));

        console.log("workExperienceRequiredOptionsWithId ", workExperienceRequiredOptionsWithId);
        setworkExperienceOptions(workExperienceRequiredOptionsWithId);
      } catch (error) {
        console.error("Failed to fetch work experience:", error);
        setworkExperienceOptions([]); // Default to an empty array in case of error
      }
    }


    fetchRecruitersData();
    fetchCountriesData(); // Call the function
    fetchJobTypesData();
    fetchJobStatusData();
    fetchIndustryData();
    fetchWorkExperienceData()
  }, []);

  return (
    <div className="container">
      {/* Only render the MyModal component if showModal is true */}
      {showModal && (
        <AddDepartmentModal
          initialData={data}
          onClose={handleCloseModal}
          onSave={handleSaveData}
        />
      )}


      {/* Use the StatusMessage component */}
      <StatusMessage status={status} errorMessage={errorMessage} />




      <nav className="navbar navbar-expand-lg p-3" style={{ backgroundColor: "#e3f2fd" }}>
        <div className="container-fluid">
          <span className="navbar-brand">
            <b> Create Job Opening</b>
          </span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
            {/* Add your new content here */}
            <div className="d-flex justify-content-end gap-3 mt-1">
              <button type="button" className="btn-sm btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                className="btn-sm btn btn-primary"
                onClick={handleSubmit}
              >
                Save and Publish
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* <p>{hiringManagerOptions.join(", ")}</p> */}
      <div className="row">
        <div className="col-md-12">
          {/* JOB OPENING INFORMATION */}
          <div className="card border-0">
            <div className="card-header bg-white">Job Opening Information</div>
            <div className="card-body">
              <table className="table">
                <tbody>
                  {/* Row: Posting Title & Department Name */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="postingTitle"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Posting Title <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "postingTitle"
                        )}`}
                        id="postingTitle"
                        name="postingTitle"
                        value={formData.postingTitle}
                        onChange={handleInputChange}
                        placeholder="Enter posting title"
                      />
                      <div className={getFeedbackClass("postingTitle")}>
                        {getFeedbackMessage("postingTitle")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      <label
                        htmlFor="departmentName"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Department Name <span className="text-danger fs-5">*</span>{" "}
                        <strong>{data.departmentName}</strong>
                      </label>
                    </td>
                    <td>
                      <div className="d-flex position-relative">
                        <input
                          type="text"
                          className={`form-control form-control-sm small-placeholder pe-5  ${getValidationClass(
                            "departmentName"
                          )}`}
                          id="departmentName"
                          name="departmentName"
                          value={formData.departmentName}
                          onChange={handleInputChange}
                          placeholder="Enter department name"
                        />
                        <button
                          className="btn  btn-light  py-0 position-absolute top-50 end-0 translate-middle-y "
                          style={{ whiteSpace: "nowrap", height: "33.1px", marginRight: '0.8px', borderRadius: "0px 3.2px 3.2px 0px" }}
                          onClick={handleOpenModal}
                        >
                          <i className="bi bi-buildings fs-6 "></i>
                        </button>
                        {/* <button
                          className="btn-sm btn btn-primary ms-2"
                          style={{ whiteSpace: "nowrap" }}
                          onClick={handleOpenModal}
                        >
                          Create Department
                        </button> */}
                      </div>
                      <div className={getFeedbackClass("departmentName")}>
                        {getFeedbackMessage("departmentName")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Title & Hiring Manager */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="title"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Title <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <TypeAheadDropdown
                        id="title"
                        name="title"
                        options={titles}
                        selectedValue={formData.title}
                        placeholder="Choose a title"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: selectedOption,
                          }))
                        }
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "title"
                        )}`}
                        getValidationclassName={getValidationClass}
                      />

                      <div className={getFeedbackClass("title")}>
                        {getFeedbackMessage("title")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      <label
                        htmlFor="hiringManager"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Hiring Manager <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <TypeAheadDropdown
                        id="hiringManager "
                        name="hiringManager"
                        options={hiringManagerOptions}
                        selectedValue={formData.hiringManager}
                        placeholder="Choose a hiring"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            hiringManager: selectedOption,
                          }))
                        }
                        value={formData.hiringManager}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "hiringManager"
                        )}`}
                        getValidationclassName={getValidationClass}

                      />

                      <div className={getFeedbackClass("hiringManager")}>
                        {getFeedbackMessage("hiringManager")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Assigned Recruiter & Number of Positions */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="assignedRecruiter"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Assigned Recruiter(s) <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      {/* <select
                        name="assignedRecruiter"
                        value={formData.assignedRecruiter}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select Recruter</option>
                        {recruters.map((recruter) => (
                          <option key={recruter.id} value={recruter.id}>
                            {recruter.firstName} {recruter.lastName}
                          </option>
                        ))}
                      </select> */}

                      <TypeAheadDropdown
                        id="assignedRecruiter "
                        name="assignedRecruiter"
                        options={recruters}
                        selectedValue={formData.assignedRecruiter}
                        placeholder="Choose a hiring"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            assignedRecruiter: selectedOption,
                          }))
                        }
                        value={formData.assignedRecruiter}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "assignedRecruiter"
                        )}`}
                        getValidationclassName={getValidationClass}

                      />

                      <div className={getFeedbackClass("assignedRecruiter")}>
                        {getFeedbackMessage("assignedRecruiter")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      {" "}
                      <label
                        htmlFor="noOfPositions"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Number of Positions <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="number"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "noOfPositions"
                        )}`}
                        id="noOfPositions"
                        name="noOfPositions"
                        value={formData.noOfPositions}
                        onChange={handleInputChange}
                        placeholder="1"
                      />
                      <div className={getFeedbackClass("noOfPositions")}>
                        {getFeedbackMessage("noOfPositions")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Target Date & Date Opened */}
                  <tr>
                    <td className="border-0 text-end">
                      {" "}
                      <label
                        htmlFor="targetDate"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Target Date <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="date"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "targetDate"
                        )}`}
                        id="targetDate"
                        name="targetDate"
                        value={formData.targetDate}
                        onChange={handleInputChange}
                      />
                      <div className={getFeedbackClass("targetDate")}>
                        {getFeedbackMessage("targetDate")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      {" "}
                      <label
                        htmlFor="dateOpened"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Date Opened <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="date"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "dateOpened"
                        )}`}
                        id="dateOpened"
                        name="dateOpened"
                        value={formData.dateOpened}
                        onChange={handleInputChange}
                      />
                      <div className={getFeedbackClass("dateOpened")}>
                        {getFeedbackMessage("dateOpened")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Job Opening Status & Job Type (optional or required if you like) */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="jobOpeningStatus"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Job Opening Status (optional)
                      </label>
                    </td>
                    <td>
                      <TypeAheadDropdown
                        id="jobOpeningStatus "
                        name="jobOpeningStatus"
                        options={jobOpeningStatusOptions}
                        selectedValue={formData.jobOpeningStatus}
                        placeholder="Choose a hiring"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobOpeningStatus: selectedOption,
                          }))
                        }
                        value={formData.jobOpeningStatus}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "jobOpeningStatus"
                        )}`}
                        getValidationclassName={getValidationClass}
                      />
                      <div className={getFeedbackClass("jobType")}>
                        {getFeedbackMessage("jobType")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      <label
                        htmlFor="jobType"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Job Type (optional)
                      </label>
                    </td>
                    <td>
                      {" "}
                      <TypeAheadDropdown
                        id="jobType "
                        name="jobType"
                        options={jobTypeOptions}
                        selectedValue={formData.jobType}
                        placeholder="Choose a Status"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobType: selectedOption,
                          }))
                        }
                        value={formData.jobType}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "jobType"
                        )}`}
                        getValidationclassName={getValidationClass}
                      />
                      <div className={getFeedbackClass("jobOpeningStatus")}>
                        {getFeedbackMessage("jobOpeningStatus")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Salary & Skills */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="salary"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Salary <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "salary"
                        )}`}
                        id="salary"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="Enter salary"
                      />

                      <div className={getFeedbackClass("salary")}>
                        {getFeedbackMessage("salary")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      <label
                        htmlFor="skills"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Required Skills <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <TokenizedTagInputForm
                        suggestionList={[
                          "java",
                          "javascript",
                          "reactjs",
                          "python",
                          "angular",
                        ]}
                        className="form-control-sm small-placeholder"
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleSkillsChange} // Notify parent of changes
                        placeholder="Search and add skills"
                      />
                      <div className={getFeedbackClass("skills")}>
                        {getFeedbackMessage("skills")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Remote Job checkbox */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="remoteJob"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Remote Job (optional)
                      </label>
                    </td>
                    <td>


                      <div className="form-check form-switch">
                        {/* <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault"> */}
                        <input
                          type="checkbox"
                          className={`form-check-input ${getValidationClass(
                            "remoteJob"
                          )}`}
                          id="remoteJob"
                          name="remoteJob"
                          checked={formData.remoteJob}
                          onChange={handleInputChange}
                        />
                        {/* <label className="form-check-label" htmlhtmlFor="flexSwitchCheckDefault">Default switch</label> */}
                      </div>
                      <div className={getFeedbackClass("remoteJob")}>
                        {getFeedbackMessage("remoteJob")}
                      </div>
                    </td>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="industry"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Industry
                      </label>
                    </td>
                    <td>
                      <TypeAheadDropdown
                        id="industry"
                        name="industry"
                        options={industryOptions}
                        selectedValue={formData.industry}
                        placeholder="Choose a recruiter"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            industry: selectedOption,
                          }))
                        }
                        value={formData.industry}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "industry"
                        )}`}
                        getValidationclassName={getValidationClass}
                      />
                      <div className={getFeedbackClass("industry")}>
                        {getFeedbackMessage("industry")}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={12}>
                      <div className="card-header bg-white">
                        Address Information
                      </div>
                    </td>
                  </tr>
                  {/* Row: City & Province */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="city"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        City <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          type="text"
                          className={`form-control form-control-sm small-placeholder ${getValidationClass(
                            "city"
                          )}`}
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}

                          placeholder="Enter city"
                        />
                      </div>
                      <div className={getFeedbackClass("city")}>
                        {getFeedbackMessage("city")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      <label
                        htmlFor="province"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Province <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "province"
                        )}`}
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        placeholder="Enter province"
                      />
                      <div className={getFeedbackClass("province")}>
                        {getFeedbackMessage("province")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Country & Postal Code */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="country"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Country <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>


                      <TypeAheadDropdown

                        id="country"
                        name="country"
                        options={countryOptions}
                        selectedValue={formData.country}
                        placeholder="Choose a Country"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            country: selectedOption,
                          }))
                        }
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "country"
                        )}`}
                        getValidationclassName={getValidationClass}
                      />

                      <div className={getFeedbackClass("country")}>
                        {getFeedbackMessage("country")}
                      </div>
                    </td>

                    <td className="border-0 text-end">
                      <label
                        htmlFor="postalCode"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Postal Code <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "postalCode"
                        )}`}
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Enter postal code"
                      />
                      <div className={getFeedbackClass("postalCode")}>
                        {getFeedbackMessage("postalCode")}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={12}>
                      <div className="card-header bg-white">
                        Description Information
                      </div>
                    </td>
                  </tr>
                  {/* Row: Work Experience */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="workExperience"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Work Experience <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td>

                      <TypeAheadDropdown
                        id="workExperience "
                        name="workExperience"
                        options={workExperienceOptions}
                        selectedValue={formData.workExperience}
                        placeholder="Choose a hiring"
                        onSelect={(selectedOption) =>
                          setFormData((prev) => ({
                            ...prev,
                            jobOpeningStatus: selectedOption,
                          }))
                        }
                        value={formData.workExperience}
                        onChange={handleInputChange}
                        className={`form-select form-select-sm small-placeholder ${getValidationClass(
                          "workExperience"
                        )}`}
                        getValidationclassName={getValidationClass}
                      />
                      <div className={getFeedbackClass("workExperience")}>
                        {getFeedbackMessage("workExperience")}
                      </div>
                    </td>
                  </tr>



                  {/* Row: Job Description */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="jobDescription"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Job Description <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td colSpan="3">
                      <textarea
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "jobDescription"
                        )}`}
                        id="jobDescription"
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleInputChange}
                        placeholder="Enter job description"
                      />
                      <div className={getFeedbackClass("jobDescription")}>
                        {getFeedbackMessage("jobDescription")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Requirements */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="requirements"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Requirements <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td colSpan="3">
                      <textarea
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "requirements"
                        )}`}
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        placeholder="Enter job requirements"
                      />
                      <div className={getFeedbackClass("requirements")}>
                        {getFeedbackMessage("requirements")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Benefits */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="benefits"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Benefits <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td colSpan="3">
                      <textarea
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "benefits"
                        )}`}
                        id="benefits"
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleInputChange}
                        placeholder="Enter job benefits"
                      />
                      <div className={getFeedbackClass("benefits")}>
                        {getFeedbackMessage("benefits")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Job Summary (File Input) */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="jobSummary"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Job Summary <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td colSpan="3">
                      <input
                        type="file"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "jobSummary"
                        )}`}
                        id="jobSummary"
                        name="jobSummary"
                        onChange={handleInputChange}
                      />
                      <div className={getFeedbackClass("jobSummary")}>
                        {getFeedbackMessage("jobSummary")}
                      </div>
                    </td>
                  </tr>

                  {/* Row: Other Attachments (File Input) */}
                  <tr>
                    <td className="border-0 text-end">
                      <label
                        htmlFor="otherAttachments"
                        className="form-label fs-0-point-7 mb-0 me-2"
                      >
                        Other Attachments <span className="text-danger fs-5">*</span>
                      </label>
                    </td>
                    <td colSpan="3">
                      <input
                        type="file"
                        className={`form-control form-control-sm small-placeholder ${getValidationClass(
                          "otherAttachments"
                        )}`}
                        id="otherAttachments"
                        name="otherAttachments"
                        onChange={handleInputChange}
                      />
                      <div className={getFeedbackClass("otherAttachments")}>
                        {getFeedbackMessage("otherAttachments")}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* </form> */}
    </div>
  );
}