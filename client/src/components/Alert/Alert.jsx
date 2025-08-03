import React from 'react'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Terminal } from 'lucide-react'

const Alert = ({ Icon, title, description}) => {
  return (
    <Alert>
        {Icon}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
            {description}
        </AlertDescription>
    </Alert>
  )
}

export default Alert



