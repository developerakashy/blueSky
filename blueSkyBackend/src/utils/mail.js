import sgMail from '@sendgrid/mail'
import bcrypt from 'bcrypt'
import { User } from '../models/user.models.js'
import { ApiError } from './ApiError.js'
import { Resend } from 'resend';
import { response } from 'express';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (email, emailType, userId) => {

    try {
        let updatedUser
        const user = await User.findById(userId)

        if(!user) throw new ApiError(400, 'user not found')

        const codeExpired = !user?.verificationCode || parseInt(user?.verificationCodeExpiry) < Date.now()
        console.log(user)

        const verificationCode = parseInt((Math.random() * 899999) + 100000)

        if(emailType === 'VERIFY' && codeExpired){
            updatedUser = await User.findByIdAndUpdate(userId,
                {
                    verificationCode,
                    verificationCodeExpiry: Date.now() + (15 * 60 * 1000)
                },
                {
                  new: true
                }
            )




        } else {

        }

        const msg = {
            from: 'developerakashy@gmail.com',
            to: email,
            subject: emailType === 'VERIFY' ? 'Verify Your Email' : 'Reset Your Password',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="margin-bottom:0">${emailType === 'VERIFY' ? 'BlueSky Email Verification' : 'Password Reset'}</h2>
                <p>6-digit verification code to ${
                  emailType === 'VERIFY' ? 'verify your email' : 'reset your password'
                }:</p>
                <p
                   style="font-size: 1.8rem; margin: 0 0; color: black">
                  ${emailType === 'VERIFY' ? codeExpired ? verificationCode : user?.verificationCode :  'Reset Password'}
                </p>
                <p style="margin-top: 20px; color: #666;">
                  If you didn't request this, please ignore this email.
                </p>
              </div>
            `
        }

        await sgMail.send(msg)

        return codeExpired ? updatedUser?.verificationCodeExpiry : user?.verificationCodeExpiry


    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while sending mail')
    }
}

export { sendEmail }
