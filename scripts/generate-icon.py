"""Generate app icon: shopping cart with checkmark on teal gradient background."""
from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024
PADDING = 140
CENTER = SIZE // 2

img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# --- Background: rounded rectangle with teal gradient ---
def rounded_rect_gradient(draw, img, bbox, radius, color_top, color_bottom):
    """Draw a rounded rectangle with vertical gradient."""
    x0, y0, x1, y1 = bbox
    # Create gradient
    for y in range(y0, y1):
        t = (y - y0) / (y1 - y0)
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * t)
        draw.line([(x0, y), (x1, y)], fill=(r, g, b, 255))

    # Create mask for rounded corners
    mask = Image.new('L', (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(bbox, radius=radius, fill=255)

    # Apply mask
    img.putalpha(mask)

color_top = (0, 185, 165)      # Teal
color_bottom = (0, 140, 130)   # Darker teal
corner_radius = 220

rounded_rect_gradient(draw, img, [0, 0, SIZE - 1, SIZE - 1], corner_radius, color_top, color_bottom)

# --- Shopping cart ---
WHITE = (255, 255, 255, 255)
SEMI_WHITE = (255, 255, 255, 200)
LINE_WIDTH = 38

# Cart body - angled trapezoid shape
cart_left = 220
cart_right = 780
cart_top = 320
cart_bottom = 600
cart_taper = 60  # How much narrower the bottom is

# Cart handle (horizontal bar at top, extending left)
handle_y = 290
handle_left = 160
draw.line([(handle_left, handle_y), (cart_left, handle_y)], fill=WHITE, width=LINE_WIDTH)

# Angled line from handle junction down to cart bottom-left
draw.line([(cart_left, handle_y), (cart_left + cart_taper, cart_bottom)], fill=WHITE, width=LINE_WIDTH)

# Cart body lines
# Left side
draw.line([(cart_left, cart_top), (cart_left + cart_taper, cart_bottom)], fill=WHITE, width=LINE_WIDTH)
# Bottom
draw.line([(cart_left + cart_taper, cart_bottom), (cart_right - cart_taper, cart_bottom)], fill=WHITE, width=LINE_WIDTH)
# Right side
draw.line([(cart_right, cart_top), (cart_right - cart_taper, cart_bottom)], fill=WHITE, width=LINE_WIDTH)
# Top
draw.line([(cart_left, cart_top), (cart_right, cart_top)], fill=WHITE, width=LINE_WIDTH)

# Cart wheels
wheel_radius = 32
wheel_y = cart_bottom + 70
left_wheel_x = cart_left + cart_taper + 50
right_wheel_x = cart_right - cart_taper - 50

draw.ellipse(
    [(left_wheel_x - wheel_radius, wheel_y - wheel_radius),
     (left_wheel_x + wheel_radius, wheel_y + wheel_radius)],
    fill=WHITE
)
draw.ellipse(
    [(right_wheel_x - wheel_radius, wheel_y - wheel_radius),
     (right_wheel_x + wheel_radius, wheel_y + wheel_radius)],
    fill=WHITE
)

# Inner wheel detail (hub)
hub_radius = 12
draw.ellipse(
    [(left_wheel_x - hub_radius, wheel_y - hub_radius),
     (left_wheel_x + hub_radius, wheel_y + hub_radius)],
    fill=color_bottom + (255,)
)
draw.ellipse(
    [(right_wheel_x - hub_radius, wheel_y - hub_radius),
     (right_wheel_x + hub_radius, wheel_y + hub_radius)],
    fill=color_bottom + (255,)
)

# --- Checkmark circle (overlapping top-right of cart) ---
check_center_x = 680
check_center_y = 280
check_radius = 130

# White circle background
draw.ellipse(
    [(check_center_x - check_radius, check_center_y - check_radius),
     (check_center_x + check_radius, check_center_y + check_radius)],
    fill=WHITE
)

# Green checkmark inside circle
check_color = (0, 160, 140, 255)
check_width = 36

# Checkmark path: short stroke down-right, then long stroke down-left (reversed)
p1 = (check_center_x - 55, check_center_y + 5)    # Start of short stroke
p2 = (check_center_x - 15, check_center_y + 50)    # Bottom of check (junction)
p3 = (check_center_x + 60, check_center_y - 45)    # End of long stroke

draw.line([p1, p2], fill=check_color, width=check_width)
draw.line([p2, p3], fill=check_color, width=check_width)

# Round the joints and endpoints
joint_r = check_width // 2
for p in [p1, p2, p3]:
    draw.ellipse(
        [(p[0] - joint_r, p[1] - joint_r), (p[0] + joint_r, p[1] + joint_r)],
        fill=check_color
    )

# --- Save outputs ---
# Main icon (1024x1024)
img.save('assets/icon.png', 'PNG')

# Adaptive icon foreground (same thing)
img.save('assets/android-icon-foreground.png', 'PNG')

# Splash icon (smaller, centered)
splash = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 0))
icon_small = img.resize((512, 512), Image.LANCZOS)
splash.paste(icon_small, (256, 256), icon_small)
splash.save('assets/splash-icon.png', 'PNG')

# Favicon (48x48)
favicon = img.resize((48, 48), Image.LANCZOS)
favicon.save('assets/favicon.png', 'PNG')

print('Generated icons:')
print('  assets/icon.png (1024x1024)')
print('  assets/android-icon-foreground.png (1024x1024)')
print('  assets/splash-icon.png (1024x1024 with centered 512x512 icon)')
print('  assets/favicon.png (48x48)')
