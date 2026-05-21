"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react"
import { cn } from "@/lib/utils"

function Slider({ className, ...props }: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track 
        data-slot="slider-track"
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted"
      >
        <SliderPrimitive.Indicator 
          data-slot="slider-range"
          className="absolute h-full bg-primary" 
        />
      </SliderPrimitive.Track>
      
      {/* Supports multiple thumbs for range selection */}
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 cursor-grab"
      />
      
      {/* If it's a range slider, we might have a second thumb */}
      {(props.defaultValue as number[])?.length > 1 && (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 cursor-grab"
        />
      )}
    </SliderPrimitive.Root>
  )
}

export { Slider }
