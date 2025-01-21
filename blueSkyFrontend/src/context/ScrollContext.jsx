import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";

export const ScrollContext = createContext()

export const ScrollProvider = ({children}) => {
    const [scrollPositions, setScrollPositions] = useState({})
    const location = useLocation()

    const throttle = (func, limit) => {
        let throttle
        return function(...args){
            if(!throttle){
                func.apply(this, args)
                throttle = true
                setTimeout(() => throttle = false, limit)
            }
        }
    }

    useEffect(() => {
        const handleScroll = throttle(() => {
            setScrollPositions(prev => ({
                ...prev,
                [location.pathname]: window.scrollY
            }))

            console.log('event set')
        }, 100)

        window.addEventListener('scroll', handleScroll)

        return () => {
            console.log(scrollPositions)
            window.removeEventListener('scroll', handleScroll)
        }

    }, [location.pathname])

    useEffect(() => {
    const currentPosition = window.scrollY;
    if (currentPosition > 0) {
      setScrollPositions(prev => ({
        ...prev,
        [location.pathname]: currentPosition
      }));
    }

    // Restore scroll position after navigation
    const restorePosition = () => {
      const savedPosition = scrollPositions[location.pathname] || 0;
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
      }, 40)
    };

    // Use requestAnimationFrame for smoother restoration
    requestAnimationFrame(restorePosition);
    // restorePosition()

    }, [location.pathname])

    return(
        <ScrollContext.Provider value={{scrollPositions}}>
            {children}
        </ScrollContext.Provider>
    )
}

export const useScrollContext = () => useContext(ScrollContext)
