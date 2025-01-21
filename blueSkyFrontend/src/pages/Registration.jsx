import React, { useEffect, useState } from "react";
import StepOne from "../components/auth/StepOne";
import StepTwo from "../components/auth/StepTwo";
import StepThree from "../components/auth/StepThree";

function Registration(){
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        username: "",
        fullname: "",
        dob: "",
        password: "",
        email: "",
        description: "",
        avatar: "",
        coverImage: ""
    })

    useEffect(() => {
        console.log(formData)
    }, [formData])

    const nextStep = () => {
        setStep(prev => prev + 1)
    }

    const prevStep = () => {
        setStep(prev => prev - 1)
    }

    const updateFormData = (data) => {
        setFormData({...formData, ...data})
    }

    return(
        <>
            {step === 1 &&
            <StepOne
                nextStep={nextStep}
                updateFormData={updateFormData}
                formData={formData}
            />
            }

            {step === 2 &&
            <StepTwo
                nextStep={nextStep}
                prevStep={prevStep}
                updateFormData={updateFormData}
                formData={formData}
            />
            }

            {step === 3 &&
            <StepThree
                formData={formData}
                updateFormData={updateFormData}
            />
            }
        </>
    )
}

export default Registration
