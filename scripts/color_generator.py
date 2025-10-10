#!/usr/bin/env python3
"""
高对比度颜色生成器
生成50+种具有最大视觉差异的颜色，用于用户标识
"""

import colorsys
import math
import json

def generate_high_contrast_colors(num_colors=60):
    """
    使用HSL颜色空间生成高对比度颜色
    通过均匀分布色相并优化饱和度和亮度来最大化视觉差异
    """
    colors = []
    
    # 第一层：主要色相均匀分布
    primary_hues = []
    for i in range(12):  # 12个主要色相
        hue = i / 12.0
        primary_hues.append(hue)
    
    # 第二层：在主要色相之间插入中间色相
    secondary_hues = []
    for i in range(12):
        hue = (i + 0.5) / 12.0
        secondary_hues.append(hue)
    
    # 第三层：微调色相
    tertiary_hues = []
    for i in range(12):
        hue1 = (i + 0.25) / 12.0
        hue2 = (i + 0.75) / 12.0
        tertiary_hues.extend([hue1, hue2])
    
    # 合并所有色相
    all_hues = primary_hues + secondary_hues + tertiary_hues
    
    # 为每个色相生成不同的饱和度和亮度组合
    saturation_levels = [0.9, 0.7, 0.5]  # 高、中、低饱和度
    lightness_levels = [0.6, 0.4, 0.8]   # 中、暗、亮
    
    color_index = 0
    for hue in all_hues:
        if color_index >= num_colors:
            break
            
        # 为每个色相选择最佳的饱和度和亮度组合
        sat_idx = color_index % len(saturation_levels)
        light_idx = (color_index // len(saturation_levels)) % len(lightness_levels)
        
        saturation = saturation_levels[sat_idx]
        lightness = lightness_levels[light_idx]
        
        # 转换为RGB
        r, g, b = colorsys.hls_to_rgb(hue, lightness, saturation)
        
        # 转换为十六进制
        hex_color = '#{:02x}{:02x}{:02x}'.format(
            int(r * 255), int(g * 255), int(b * 255)
        )
        
        colors.append({
            'hex': hex_color,
            'hue': hue,
            'saturation': saturation,
            'lightness': lightness,
            'index': color_index
        })
        
        color_index += 1
    
    return colors

def calculate_color_distance(color1, color2):
    """
    计算两个颜色在HSL空间中的距离
    """
    h_diff = min(abs(color1['hue'] - color2['hue']), 
                 1 - abs(color1['hue'] - color2['hue']))  # 处理色相环形距离
    s_diff = abs(color1['saturation'] - color2['saturation'])
    l_diff = abs(color1['lightness'] - color2['lightness'])
    
    # 色相差异权重最高，因为对视觉差异影响最大
    return h_diff * 0.6 + s_diff * 0.2 + l_diff * 0.2

def optimize_color_sequence(colors):
    """
    优化颜色序列，确保相邻颜色有最大差异
    使用贪心算法选择下一个距离最远的颜色
    """
    if not colors:
        return []
    
    optimized = [colors[0]]  # 从第一个颜色开始
    remaining = colors[1:]
    
    while remaining:
        last_color = optimized[-1]
        
        # 找到与最后一个颜色距离最远的颜色
        best_color = None
        best_distance = -1
        
        for color in remaining:
            distance = calculate_color_distance(last_color, color)
            if distance > best_distance:
                best_distance = distance
                best_color = color
        
        optimized.append(best_color)
        remaining.remove(best_color)
    
    return optimized

def generate_optimized_color_palette():
    """
    生成优化的颜色调色板
    """
    print("🎨 生成高对比度颜色调色板...")
    
    # 生成基础颜色
    colors = generate_high_contrast_colors(60)
    print(f"✅ 生成了 {len(colors)} 种基础颜色")
    
    # 优化颜色序列
    print("🔄 优化颜色序列以最大化相邻颜色差异...")
    optimized_colors = optimize_color_sequence(colors)
    
    # 提取hex颜色列表
    hex_colors = [color['hex'] for color in optimized_colors]
    
    print(f"✅ 优化完成，共 {len(hex_colors)} 种颜色")
    print("🎯 颜色预览（前10种）:")
    for i, color in enumerate(hex_colors[:10]):
        print(f"  {i+1:2d}. {color}")
    
    return hex_colors

def save_color_palette_to_js(colors, output_file):
    """
    将颜色调色板保存为JavaScript格式
    """
    js_content = f"""// 自动生成的高对比度颜色调色板
// 包含 {len(colors)} 种优化的颜色，确保最大视觉差异

export const HIGH_CONTRAST_COLORS = {json.dumps(colors, indent=4)};

// 使用示例：
// const userColor = HIGH_CONTRAST_COLORS[userIndex % HIGH_CONTRAST_COLORS.length];
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"💾 颜色调色板已保存到: {output_file}")

def main():
    """主函数"""
    print("🚀 开始生成高对比度颜色调色板...")
    
    # 生成优化的颜色调色板
    colors = generate_optimized_color_palette()
    
    # 保存为JSON文件（供Python使用）
    output_dir = "/data/zicheng/personal_website/UAL_M2-copilot-debug-data-upload-feature"
    json_file = f"{output_dir}/data/color_palette.json"
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({
            'colors': colors,
            'total_count': len(colors),
            'generated_at': '2025-10-10'
        }, f, indent=2)
    
    print(f"💾 颜色数据已保存到: {json_file}")
    
    # 显示颜色统计
    print(f"""
🎉 颜色调色板生成完成！
📊 统计信息:
   - 总颜色数: {len(colors)}
   - 色相分布: 均匀分布在色相环上
   - 优化算法: 贪心算法最大化相邻颜色差异
   - 格式: 十六进制 (#RRGGBB)
    """)

if __name__ == "__main__":
    main()