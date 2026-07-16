import * as authService from '../services/auth.service.js'

export async function register(req, res, next) {
  try {
    const user = await authService.register(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function googleLogin(req, res, next) {
  try {
    const result = await authService.loginWithGoogle(req.body)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
