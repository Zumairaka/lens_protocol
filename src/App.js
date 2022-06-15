import "./App.css";
import React, { useState, useEffect } from "react";
import { urqlClient, fetchProfiles, createProfile, apolloClient } from "./api";
import { gql } from "@apollo/client";

function App() {
  // state
  const [values, setValues] = useState({
    username: "",
    handle: "",
    bio: "",
    // profilePic: "",
    formData: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profiles, setProfiles] = useState([]);

  // data destructuring
  const { username, handle, bio, formData } = values;

  // call preload
  useEffect(() => {
    getProfile();
    console.log(profiles);
  }, [profiles]);

  // fetching profiles
  const getProfile = async () => {
    try {
      const response = await urqlClient.query(fetchProfiles).toPromise();
      // console.log(response.data.recommendedProfiles);
      setProfiles(response.data.recommendedProfiles);
      setValues({ ...values, formData: new FormData() });
    } catch (err) {
      setError(err);
    }
  };

  // creating profile
  const makeProfile = async (createProfileRequest) => {
    const response = await apolloClient.mutate({
      mutation: gql(createProfile),
      variables: {
        request: createProfileRequest,
      },
    });
    console.log(response);
  };

  // error message
  const errorMessage = () => {
    return (
      <div
        style={{ display: error ? "block" : "none" }}
        className="alert alert-danger"
      >
        {error}
      </div>
    );
  };

  // success message
  const successMessage = () => {
    return (
      <div
        className="alert alert-success"
        style={{ display: success ? "" : "none" }}
      >
        Profile has been created successfully!
      </div>
    );
  };

  // handle change
  const handleChange = (name) => (event) => {
    setError(false);

    const value =
      name === "profilePic" ? event.target.files[0] : event.target.value;
    formData.set(name, value);
    setValues({ ...values, [name]: value });
  };

  // on submit
  const onSubmit = async (event) => {
    setSuccess(false);
    setError(false);
    await makeProfile(formData)
      .then((data) => {
        console.log("data", data);
        if (data.error) {
          setError(data.error);
          setSuccess(false);
        } else {
          setSuccess(true);
          setValues({
            ...values,
            formData: "",
            username: "",
            handle: "",
            bio: "",
          });
        }
      })
      .catch(setError("profile creation failed"));
  };

  return (
    <div className="App">
      <p className="App-title">Lets Connect</p>

      <div>
        <h2>Recommended Profiles</h2>
        {profiles.map((profile, index) => (
          <div>
            <h3>
              {++index}
              {`:  `}
              {profile.name}
            </h3>
            <p>
              {`handle:  `}
              {profile.handle}
            </p>
            <p>
              {`bio:  `}
              {profile.bio}
            </p>
            {profile.picture ? (
              <img className="Image" src={profile.picture.original.url} />
            ) : (
              <img className="Image" src="../public/image.jpg" />
            )}
          </div>
        ))}
      </div>

      <header className="App-header">
        {successMessage()}
        {errorMessage()}
        <p className="App-text">Create a Profile</p>
        <form>
          <div className="form-group">
            <div className="form-control">
              <label htmlFor="username" className="App-label">
                Name
              </label>
              <input
                className="form-item"
                type="text"
                name="username"
                id="username"
                placeholder="username"
                autoFocus
                onChange={handleChange("username")}
                value={username}
              />
            </div>

            <div className="form-control">
              <label htmlFor="handle" className="App-label">
                Handle
              </label>
              <input
                className="form-item"
                type="text"
                name="handle"
                id="handle"
                placeholder="handle"
                autoFocus
                onChange={handleChange("handle")}
                value={handle}
              />
            </div>

            <div className="form-control form-control-full">
              <label htmlFor="bio" className="App-label">
                Bio
              </label>
              <textarea
                className="form-item"
                name="bio"
                id="bio"
                placeholder="enter bio"
                autoFocus
                onChange={handleChange("bio")}
                value={bio}
              />
            </div>

            {/* <div className="form-control form-control-full">
              <label htmlFor="profilePic" className="App-label">
                Profile pic
              </label>
              <input
                className="form-item"
                type="file"
                name="profilePic"
                id="profilePic"
                accept="image"
                placeholder="upload profile pic"
                autoFocus
                onChange={handleChange("profilePic")}
              />
            </div> */}

            <div className="form-control form-control-full">
              <button type="submit" className="thm-btn" onClick={onSubmit}>
                Submit
              </button>
            </div>
          </div>
        </form>
      </header>
    </div>
  );
}

export default App;
