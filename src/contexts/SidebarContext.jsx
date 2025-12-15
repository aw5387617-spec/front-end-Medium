import React, { createContext, useContext, useState } from 'react'

const SidebarContext = createContext()

export const useSidebar = () => {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}

export const SidebarProvider = ({ children }) => {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)

    const toggleLeftSidebar = () => {
        setIsLeftSidebarOpen(!isLeftSidebarOpen)
    }

    const toggleBothSidebars = () => {
        setIsLeftSidebarOpen(!isLeftSidebarOpen)
    }

    const closeBothSidebars = () => {
        setIsLeftSidebarOpen(false)
    }

    const areBothSidebarsClosed = () => {
        return !isLeftSidebarOpen
    }

    const value = {
        isLeftSidebarOpen,
        toggleLeftSidebar,
        toggleBothSidebars,
        closeBothSidebars,
        areBothSidebarsClosed
    }

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    )
}

export default SidebarContext