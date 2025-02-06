import sgMail from '@sendgrid/mail'
import bcrypt from 'bcrypt'
import { User } from '../models/user.models.js'
import { ApiError } from './ApiError.js'
import { Resend } from 'resend';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (email, emailType, userId) => {

    try {


        const user = await User.findById(userId)

        if(!user) throw new ApiError(400, 'user not found')

        const tokenStatus = user?.verificationToken && user?.verificationTokenExpiry > Date.now()

        // if(tokenStatus)
        const token = await bcrypt.hash(userId.toString(), 10)

        if(emailType === 'VERIFY'){
            await User.findByIdAndUpdate(userId?.toString(),
                {
                    verificationToken: token,
                    verificationTokenExpiry: Date.now() + (24 * 60 * 60 * 1000)
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
                <h2>${emailType === 'VERIFY' ? 'Email Verification' : 'Password Reset'}</h2>
                <p>Click the button below to ${
                  emailType === 'VERIFY' ? 'verify your email' : 'reset your password'
                }:</p>
                <a href="${process.env.DOMAIN}/verify-token?token=${token}"
                   style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                  ${emailType === 'VERIFY' ? 'Verify Email' : 'Reset Password'}
                </a>
                <p style="margin-top: 20px; color: #666;">
                  If you didn't request this, please ignore this email.
                </p>
              </div>
            `
        }

        const response = await sgMail.send(msg)

        return response


    } catch (error) {
        throw new ApiError(400, error?.message || 'something went wrong while sending mail')
    }
}

export { sendEmail }
