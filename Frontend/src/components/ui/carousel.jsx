import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "../styles/carousel.css"

const Carousel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`carousel ${className || ''}`}
    {...props}
  />
))
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`carousel-content ${className || ''}`}
    {...props}
  />
))
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`carousel-item ${className || ''}`}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`carousel-previous ${className || ''}`}
    {...props}
  >
    <ChevronLeft />
  </button>
))
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`carousel-next ${className || ''}`}
    {...props}
  >
    <ChevronRight />
  </button>
))
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } 